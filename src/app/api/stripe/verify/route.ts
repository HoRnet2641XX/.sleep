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
  const supaAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supaServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const expectedPriceId =
    process.env.STRIPE_PRICE_ID_PREMIUM ??
    process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY;

  const missing: string[] = [];
  if (!secret) missing.push("STRIPE_SECRET_KEY");
  if (!supaUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supaAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!supaServiceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `not configured. Missing: ${missing.join(", ")}` },
      { status: 503 },
    );
  }

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "authentication required" }, { status: 401 });
  }

  const authClient = createClient(supaUrl as string, supaAnonKey as string, {
    auth: { persistSession: false },
  });
  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(token);
  if (authError || !user) {
    return NextResponse.json({ error: "invalid session" }, { status: 401 });
  }

  const { sessionId } = (await req.json()) as { sessionId?: string };
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const stripe = new Stripe(secret as string, {
    apiVersion: "2026-04-22.dahlia",
  });

  let matched: Stripe.Checkout.Session;
  try {
    matched = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return NextResponse.json({
      verified: false,
      reason: "session_not_found",
    });
  }

  if (
    matched.client_reference_id !== user.id ||
    matched.payment_status !== "paid" ||
    matched.mode !== "payment"
  ) {
    return NextResponse.json({
      verified: false,
      reason: "session_not_paid_or_owner_mismatch",
    });
  }

  if (expectedPriceId) {
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId, { limit: 10 });
    const hasExpectedPrice = lineItems.data.some((item) => item.price?.id === expectedPriceId);
    if (!hasExpectedPrice) {
      return NextResponse.json({
        verified: false,
        reason: "unexpected_price",
      });
    }
  }

  const supabase = createClient(supaUrl as string, supaServiceKey as string, {
    auth: { persistSession: false },
  });

  /* 0. プロフィール存在確認 (デバッグのため) */
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id, is_premium")
    .eq("id", user.id)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json(
      {
        verified: false,
        reason: "profile_select_failed",
        details: selectError.message,
      },
      { status: 500 },
    );
  }
  if (!existing) {
    return NextResponse.json(
      {
        verified: false,
        reason: "profile_not_found",
        details: "No profile row for authenticated user",
      },
      { status: 404 },
    );
  }

  /* 1. profiles.is_premium = true (.select で実際に更新された行を取得) */
  const { data: updated, error: profileError } = await supabase
    .from("profiles")
    .update({ is_premium: true, updated_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("id, is_premium")
    .maybeSingle();

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

  /* 0行だった or is_premium が true になっていない = RLS で弾かれた可能性 */
  if (!updated || !updated.is_premium) {
    return NextResponse.json(
      {
        verified: false,
        reason: "profile_update_no_effect",
        details:
          "profiles.is_premium was not set to true. SUPABASE_SERVICE_ROLE_KEY が正しく設定されているか確認してください。",
        debugBefore: existing.is_premium,
        debugAfter: updated?.is_premium ?? null,
      },
      { status: 500 },
    );
  }

  /* 2. subscriptions: 既存をキャンセル扱いにしてから新規 active を1行追加
     (partial unique index と onConflict の相性問題を避ける) */
  await supabase
    .from("subscriptions")
    .update({ status: "canceled" })
    .eq("user_id", user.id)
    .in("status", ["active", "past_due"]);

  const { error: subError } = await supabase.from("subscriptions").insert({
    user_id: user.id,
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
