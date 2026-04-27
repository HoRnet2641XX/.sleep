import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Stripe Webhook 受信エンドポイント。
 *
 * 必要な環境変数:
 *   STRIPE_SECRET_KEY                - Stripe シークレット
 *   STRIPE_WEBHOOK_SECRET            - Webhook 署名シークレット (whsec_...)
 *   SUPABASE_SERVICE_ROLE_KEY        - サーバー側 Supabase クライアント用
 *   NEXT_PUBLIC_SUPABASE_URL         - Supabase URL
 *
 * Stripe ダッシュボードで Webhook を以下のイベントで設定:
 *   - checkout.session.completed
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supaUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supaServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secret || !whSecret || !supaUrl || !supaServiceKey) {
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  let StripeMod: { default: new (key: string) => unknown } | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const dyn = new Function("m", "return import(m)") as (
      m: string,
    ) => Promise<{ default: new (key: string) => unknown }>;
    StripeMod = await dyn("stripe");
  } catch {
    return NextResponse.json({ error: "stripe SDK not installed" }, { status: 503 });
  }
  if (!StripeMod) {
    return NextResponse.json({ error: "stripe SDK load failed" }, { status: 503 });
  }
  const Stripe = StripeMod.default;
  const stripe = new Stripe(secret) as {
    webhooks: {
      constructEvent: (
        payload: string,
        sig: string,
        secret: string,
      ) => { type: string; data: { object: Record<string, unknown> } };
    };
  };

  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  const payload = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, sig, whSecret);
  } catch (e) {
    return NextResponse.json(
      { error: `signature verification failed: ${e instanceof Error ? e.message : "unknown"}` },
      { status: 400 },
    );
  }

  const supabase = createClient(supaUrl, supaServiceKey, {
    auth: { persistSession: false },
  });

  const obj = event.data.object as Record<string, unknown>;

  switch (event.type) {
    case "checkout.session.completed": {
      const userId =
        (obj.client_reference_id as string | null) ??
        ((obj.metadata as Record<string, string> | null)?.user_id ?? null);
      const subId = obj.subscription as string | null;
      if (userId) {
        await supabase
          .from("profiles")
          .update({ is_premium: true, updated_at: new Date().toISOString() })
          .eq("id", userId);
        if (subId) {
          await supabase.from("subscriptions").upsert(
            {
              user_id: userId,
              plan: "premium",
              status: "active",
              current_period_start: new Date().toISOString(),
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              cancel_at_period_end: false,
              payment_provider: "stripe",
              provider_subscription_id: subId,
            },
            { onConflict: "user_id" },
          );
        }
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const userId = (obj.metadata as Record<string, string> | null)?.user_id ?? null;
      if (userId) {
        const status = obj.status as string;
        const isActive = status === "active" || status === "trialing";
        await supabase
          .from("profiles")
          .update({ is_premium: isActive, updated_at: new Date().toISOString() })
          .eq("id", userId);
        await supabase
          .from("subscriptions")
          .update({
            status: isActive ? "active" : "canceled",
            cancel_at_period_end: !!obj.cancel_at_period_end,
            current_period_end: obj.current_period_end
              ? new Date((obj.current_period_end as number) * 1000).toISOString()
              : undefined,
          })
          .eq("user_id", userId);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
