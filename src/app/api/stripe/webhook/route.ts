import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

/**
 * Stripe Webhook 受信エンドポイント（買い切り型）。
 *
 * 必要な環境変数:
 *   STRIPE_SECRET_KEY                - Stripe シークレット
 *   STRIPE_WEBHOOK_SECRET            - Webhook 署名シークレット (whsec_...)
 *   SUPABASE_SERVICE_ROLE_KEY        - サーバー側 Supabase クライアント用
 *   NEXT_PUBLIC_SUPABASE_URL         - Supabase URL
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const missing: string[] = [];
  if (!secret) missing.push("STRIPE_SECRET_KEY");
  if (!whSecret) missing.push("STRIPE_WEBHOOK_SECRET");
  if (!supaUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supaServiceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) {
    return NextResponse.json(
      { error: `not configured. Missing: ${missing.join(", ")}` },
      { status: 503 },
    );
  }

  const stripe = new Stripe(secret as string, {
    apiVersion: "2026-04-22.dahlia",
  });

  const sig = req.headers.get("stripe-signature");
  if (!sig)
    return NextResponse.json(
      { error: "missing signature" },
      { status: 400 },
    );

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, whSecret as string);
  } catch (e) {
    return NextResponse.json(
      {
        error: `signature verification failed: ${
          e instanceof Error ? e.message : "unknown"
        }`,
      },
      { status: 400 },
    );
  }

  const supabase = createClient(supaUrl as string, supaServiceKey as string, {
    auth: { persistSession: false },
  });

  const obj = event.data.object as unknown as Record<string, unknown>;

  switch (event.type) {
    case "checkout.session.completed": {
      const userId =
        (obj.client_reference_id as string | null) ??
        ((obj.metadata as Record<string, string> | null)?.user_id ?? null);
      const paymentStatus = obj.payment_status as string | undefined;
      /* 支払い完了済みのセッションのみプレミアム化 */
      if (userId && (!paymentStatus || paymentStatus === "paid")) {
        await supabase
          .from("profiles")
          .update({ is_premium: true, updated_at: new Date().toISOString() })
          .eq("id", userId);
        /* 既存 active を canceled にしてから新規 active を1行追加
           (partial unique index 対策で upsert を使わない) */
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("user_id", userId)
          .in("status", ["active", "past_due"]);
        await supabase.from("subscriptions").insert({
          user_id: userId,
          plan: "premium",
          status: "active",
          current_period_start: new Date().toISOString(),
          current_period_end: new Date("9999-12-31T00:00:00Z").toISOString(),
          cancel_at_period_end: false,
          payment_provider: "stripe",
          provider_subscription_id: (obj.id as string) ?? null,
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
