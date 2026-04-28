"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/lib/supabase";
import { PLANS } from "@/types";
import type { PlanType } from "@/types";

const PLAN_KEYS: PlanType[] = ["free", "premium"];

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? "h-4 w-4 text-success"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PremiumPage() {
  const router = useRouter();
  const reduced = useReducedMotion();
  const { user } = useAuth();
  const { plan: currentPlan, isPremium } = useSubscription();
  const [processing, setProcessing] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email ?? "" }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        if (res.status === 503) {
          alert("決済機能は現在準備中です。近日公開予定！");
        } else {
          alert(`決済の開始に失敗しました: ${data.error ?? "不明なエラー"}`);
        }
        setProcessing(false);
        return;
      }
      window.location.href = data.url;
    } catch (e) {
      alert(`通信エラー: ${e instanceof Error ? e.message : "不明"}`);
      setProcessing(false);
    }
  };

  // 開発環境用: プレミアムフラグの手動切替（UI動作確認用）
  const isDev = process.env.NODE_ENV !== "production";
  const [devToggling, setDevToggling] = useState(false);
  const [devError, setDevError] = useState<string | null>(null);
  const handleDevToggle = async () => {
    if (!user) return;
    setDevToggling(true);
    setDevError(null);
    const next = !isPremium;

    const { error } = await supabase
      .from("profiles")
      .update({ is_premium: next, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      setDevError(`${error.code ?? ""} ${error.message}`);
      setDevToggling(false);
      return;
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-content items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex items-center text-content-secondary hover:text-content"
            aria-label="ホームに戻る"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-content">プラン</h1>
        </div>
      </header>

      <main className="mx-auto max-w-page px-4 pb-24 pt-8">
        {/* ─── 開発用プレミアム切替 ─── */}
        {isDev && user && (
          <div className="mx-auto mb-6 max-w-md rounded-xl border border-warning/30 bg-warning/5 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-warning">[DEV] プレミアム切替</p>
                <p className="text-xs text-content-muted">
                  現在: <span className="font-medium text-content">{isPremium ? "プレミアム" : "フリー"}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={handleDevToggle}
                disabled={devToggling}
                className="rounded-lg bg-warning/20 px-3 py-1.5 text-xs font-bold text-warning transition-colors hover:bg-warning/30 disabled:opacity-40"
              >
                {devToggling ? "切替中..." : isPremium ? "フリーに戻す" : "プレミアムにする"}
              </button>
            </div>
            {devError && (
              <p className="mt-2 rounded bg-error/10 px-2 py-1.5 text-xs text-error">
                {devError}
              </p>
            )}
          </div>
        )}

        {/* ヒーロー */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduced ? 0.01 : 0.6 }}
        >
          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-primary/20"
            animate={reduced ? undefined : { scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </motion.div>
          <h2 className="mb-2 text-2xl font-bold text-content md:text-3xl">
            あなたの眠りに、もっと寄り添う
          </h2>
          <p className="text-sm text-content-secondary">
            プレミアムで自分に合った情報をもっと深く
          </p>
        </motion.div>

        {/* プランカード */}
        <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-2">
          {PLAN_KEYS.map((planKey, i) => {
            const plan = PLANS[planKey];
            const isCurrent = planKey === currentPlan;
            const isRecommended = planKey === "premium";

            return (
              <motion.div
                key={planKey}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: reduced ? 0.01 : 0.5,
                  delay: reduced ? 0 : i * 0.15,
                }}
                className={`relative overflow-hidden rounded-2xl border p-6 transition-all ${
                  isRecommended
                    ? "border-primary/40 bg-gradient-to-b from-primary/[0.08] to-surface-card shadow-lg shadow-primary/10 ring-1 ring-primary/20"
                    : "border-border/50 bg-surface-card"
                }`}
              >
                {/* おすすめバッジ */}
                {isRecommended && (
                  <div className="absolute -right-8 top-4 rotate-45 bg-gradient-to-r from-primary to-accent px-10 py-1 text-[10px] font-bold text-white">
                    おすすめ
                  </div>
                )}

                {/* プラン名 */}
                <h3 className="mb-1 text-lg font-bold text-content">{plan.name}</h3>

                {/* 価格 */}
                <div className="mb-6 flex items-baseline gap-1">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-bold text-content">¥0</span>
                  ) : (
                    <>
                      <span className="text-3xl font-bold text-content">
                        ¥{plan.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-content-muted">買い切り</span>
                    </>
                  )}
                </div>

                {/* 機能リスト */}
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckIcon
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          isRecommended ? "text-primary" : "text-content-muted"
                        }`}
                      />
                      <span className="text-sm text-content-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* アクションボタン */}
                {isCurrent ? (
                  <div className="flex items-center justify-center rounded-xl bg-surface-elevated px-4 py-3 text-sm font-medium text-content-muted">
                    現在のプラン
                  </div>
                ) : isRecommended ? (
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={processing}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-accent/80 px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        処理中...
                      </>
                    ) : (
                      "プレミアムにアップグレード"
                    )}
                  </button>
                ) : (
                  <div className="rounded-xl border border-border/30 px-4 py-3 text-center text-sm text-content-muted">
                    無料で利用中
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <motion.div
          className="mx-auto mt-16 max-w-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduced ? 0 : 0.6 }}
        >
          <h3 className="mb-6 text-center text-base font-bold text-content">よくある質問</h3>
          <div className="space-y-4">
            {[
              {
                q: "買い切りですか？継続課金ですか？",
                a: "買い切りです。一度ご購入いただくと、それ以降ずっとプレミアム機能をお使いいただけます。月額・年額の継続課金は発生しません。",
              },
              {
                q: "支払い方法は？",
                a: "クレジットカード（Stripe決済）に対応しています。VISA / MasterCard / JCB / AMEX / Diners が利用可能です。",
              },
              {
                q: "返金はできますか？",
                a: "原則として、決済完了後の返金は承っておりません。事前にフリープランで操作感を確認のうえご購入ください。サービス側の重大な不具合があった場合はお問い合わせください。",
              },
              {
                q: "フリープランでも十分使えますか？",
                a: "もちろんです。レビューの閲覧・投稿・いいね・コメントはすべて無料です。プレミアムは「自分に合った情報を深掘りしたい」方向けの拡張機能です。",
              },
            ].map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-border/40 bg-surface-card"
              >
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-content">
                  {faq.q}
                  <svg
                    className="h-4 w-4 shrink-0 text-content-muted transition-transform group-open:rotate-180"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <p className="px-4 pb-4 text-xs leading-relaxed text-content-secondary">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
