"use client";

import Link from "next/link";
import { useSubscription } from "@/hooks/useSubscription";

/**
 * プレミアム限定機能のゲート。
 * - プレミアムユーザー → children をそのまま表示
 * - フリーユーザー → ブラー + アップグレード誘導を表示
 */
export function PremiumGate({
  children,
  feature,
}: {
  children: React.ReactNode;
  /** 制限されている機能名（誘導テキストに使用） */
  feature: string;
}) {
  const { isPremium, loading } = useSubscription();

  if (loading) return <>{children}</>;

  if (isPremium) return <>{children}</>;

  return (
    <div className="relative">
      {/* コンテンツをぼかして表示（チラ見せ） */}
      <div className="pointer-events-none select-none blur-[6px]" aria-hidden="true">
        {children}
      </div>

      {/* オーバーレイ */}
      <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-surface/70 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3 px-4 text-center">
          {/* ロックアイコン */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <svg
              className="h-5 w-5 text-primary"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>

          <p className="text-sm font-semibold text-content">
            {feature}はプレミアム限定
          </p>
          <p className="text-xs text-content-muted">
            月額300円ですべての機能が使えます
          </p>

          <Link
            href="/premium"
            className="mt-1 rounded-lg bg-gradient-to-r from-primary to-accent/80 px-6 py-2 text-sm font-bold text-white shadow-md shadow-primary/20 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
          >
            プレミアムにする
          </Link>
        </div>
      </div>
    </div>
  );
}
