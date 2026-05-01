import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

/**
 * 決済完了後の検証エンドポイント（Webhookのフォールバック）。
 * クライアントが /premium?status=success で戻った時、
 * 直近の決済を Stripe API で確認して profiles.is_premium を更新する。
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing: string[] = [];
  if (!secret) missing.push("STRIPE_SECRET_KEY");
  if (!supaUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supaServiceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `not configured. Missing: ${missing.join(", ")}` },
      { status: 503 },
    );
  }

  const { userId } = (await req.json()) as { userId?: string };
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const stripe = new Stripe(secret as string, {
    apiVersion: "2026-04-22.dahlia",
  });

  /* このユーザーの直近のチェックアウトセッションを検索 */
  const sessions = await stripe.checkout.sessions.list({ limit: 30 });
  const matched = sessions.data.find(
    (s) => s.client_reference_id === userId && s.payment_status === "paid",
  );

  if (!matched) {
    return NextResponse.json({
      verified: false,
      reason: "no_paid_session",
    });
  }

  const supabase = createClient(supaUrl as string, supaServiceKey as string, {
    auth: { persistSession: false },
  });

  /* 1. profiles.is_premium = true */
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ is_premium: true, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (profileError) {
    return NextResponse.json(
      {
        verified: false,
        reason: "profile_update_failed",
        details: profileError.message,
      },
      { status: 500 },
    );
  }

  /* 2. subscriptions: 既存をキャンセル扱いにしてから新規 active を1行追加
     (partial unique index と onConflict の相性問題を避ける) */
  await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("user_id", userId)
    .in("status", ["active", "past_due"]);

  const { error: subError } = await supabase.from("subscriptions").insert({
    user_id: userId,
    plan: "premium",
    status: "active",
    current_period_start: new Date().toISOString(),
    current_period_end: new Date("9999-12-31T00:00:00Z").toISOString(),
    cancel_at_period_end: false,
    payment_provider: "stripe",
    provider_subscription_id: matched.id,
  });

  /* subscriptions失敗は致命ではない（is_premium=trueが本流） */
  return NextResponse.json({
    verified: true,
    sessionId: matched.id,
    subscriptionWarning: subError?.message ?? null,
  });
}
