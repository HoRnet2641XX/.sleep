import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

/**
 * Stripe Checkout セッション作成エンドポイント（買い切り型）。
 *
 * 必要な環境変数:
 *   STRIPE_SECRET_KEY            - Stripe シークレット (sk_...)
 *   STRIPE_PRICE_ID_PREMIUM      - 買い切り Price ID (price_...)
 *   NEXT_PUBLIC_SITE_URL         - 本サイトのオリジン (https://...)
 */
export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const priceId =
    process.env.STRIPE_PRICE_ID_PREMIUM ??
    process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY; // 後方互換
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  /* どの環境変数が欠けているか具体的に返す（運用時のデバッグ用） */
  const missing: string[] = [];
  if (!secret) missing.push("STRIPE_SECRET_KEY");
  if (!priceId) missing.push("STRIPE_PRICE_ID_PREMIUM");
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: `Stripe is not configured. Missing: ${missing.join(", ")}`,
        missing,
      },
      { status: 503 },
    );
  }

  const { userId, email } = (await req.json()) as {
    userId?: string;
    email?: string;
  };
  if (!userId || !email) {
    return NextResponse.json(
      { error: "userId and email required" },
      { status: 400 },
    );
  }

  const stripe = new Stripe(secret as string, { apiVersion: "2026-04-22.dahlia" });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment", // 買い切り
      payment_method_types: ["card"],
      line_items: [{ price: priceId as string, quantity: 1 }],
      customer_email: email,
      client_reference_id: userId,
      metadata: { user_id: userId },
      success_url: `${siteUrl}/premium?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/premium?status=canceled`,
      locale: "ja",
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 },
      );
    }
    return NextResponse.json({ url: session.url });
  } catch (e) {
    return NextResponse.json(
      {
        error: e instanceof Error ? e.message : "unknown error",
      },
      { status: 500 },
    );
  }
}
