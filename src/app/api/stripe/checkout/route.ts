import { NextRequest, NextResponse } from "next/server";

/**
 * Stripe Checkout セッション作成エンドポイント。
 *
 * 必要な環境変数:
 *   STRIPE_SECRET_KEY              - Stripe シークレット (sk_...)
 *   STRIPE_PRICE_ID_PREMIUM_MONTHLY - 月額プランの Price ID (price_...)
 *   NEXT_PUBLIC_SITE_URL           - 本サイトのオリジン (https://...)
 *
 * セットアップ手順:
 *   1. https://dashboard.stripe.com で「商品」を作成し月額¥580の Price を作る
 *   2. Webhook で checkout.session.completed と customer.subscription.* を受け、
 *      app/api/stripe/webhook/route.ts (要追加) で profiles.is_premium を更新
 *   3. `npm i stripe` でSDKを追加
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  if (!secret || !priceId) {
    return NextResponse.json(
      {
        error: "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID_PREMIUM_MONTHLY.",
      },
      { status: 503 },
    );
  }

  const { userId, email } = (await req.json()) as {
    userId?: string;
    email?: string;
  };
  if (!userId || !email) {
    return NextResponse.json({ error: "userId and email required" }, { status: 400 });
  }

  /* Stripe を動的 import（webpackの静的解析を回避してパッケージ未追加でも壊さない） */
  let StripeMod: { default: new (key: string) => unknown } | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const dyn = new Function("m", "return import(m)") as (
      m: string,
    ) => Promise<{ default: new (key: string) => unknown }>;
    StripeMod = await dyn("stripe");
  } catch {
    return NextResponse.json(
      { error: "Stripe SDK is not installed. Run: npm i stripe" },
      { status: 503 },
    );
  }
  if (!StripeMod) {
    return NextResponse.json({ error: "Stripe SDK load failed" }, { status: 503 });
  }
  const Stripe = StripeMod.default;
  const stripe = new Stripe(secret) as {
    checkout: {
      sessions: {
        create: (
          p: Record<string, unknown>,
        ) => Promise<{ url: string | null }>;
      };
    };
  };

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    client_reference_id: userId,
    metadata: { user_id: userId },
    subscription_data: { metadata: { user_id: userId } },
    success_url: `${siteUrl}/premium?status=success`,
    cancel_url: `${siteUrl}/premium?status=canceled`,
    locale: "ja",
  });

  if (!session.url) {
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
  return NextResponse.json({ url: session.url });
}
