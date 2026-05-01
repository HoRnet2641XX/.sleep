import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

/**
 * 決済完了後の検証エンドポイント（Webhookのフォールバック）。
 * クライアントが `/premium?status=success&session_id=cs_...` で戻ってきた時、
 * 直近の決済を Stripe API で確認して profiles.is_premium を更新する。
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !supaUrl || !supaServiceKey) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const { userId } = (await req.json()) as { userId?: string };
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const stripe = new Stripe(secret, { apiVersion: "2026-04-22.dahlia" });

  /* このユーザーの直近のチェックアウトセッションを検索 */
  const sessions = await stripe.checkout.sessions.list({ limit: 20 });
  const matched = sessions.data.find(
    (s) =>
      s.client_reference_id === userId &&
      s.payment_status === "paid",
  );

  if (!matched) {
    return NextResponse.json({ verified: false, reason: "no_paid_session" });
  }

  const supabase = createClient(supaUrl, supaServiceKey, {
    auth: { persistSession: false },
  });

  await supabase
    .from("profiles")
    .update({ is_premium: true, updated_at: new Date().toISOString() })
    .eq("id", userId);

  await supabase.from("subscriptions").upsert(
    {
      user_id: userId,
      plan: "premium",
      status: "active",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date("9999-12-31T00:00:00Z").toISOString(),
      cancel_at_period_end: false,
      payment_provider: "stripe",
      provider_subscription_id: matched.id,
    },
    { onConflict: "user_id" },
  );

  return NextResponse.json({ verified: true, sessionId: matched.id });
}
