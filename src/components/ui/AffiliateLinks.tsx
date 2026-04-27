"use client";

import { amazonSearchUrl, rakutenSearchUrl } from "@/lib/affiliate";
import { useSubscription } from "@/hooks/useSubscription";
import type { ReviewCategory } from "@/types";

const CATEGORY_SEARCH_SUFFIX: Record<ReviewCategory, string> = {
  medicine: "",
  mattress: " マットレス",
  pillow: " 枕",
  chair: " 椅子",
  habit: "",
};

/** カテゴリが物販系かどうか（生活習慣はリンク不要） */
function isShoppable(category: ReviewCategory): boolean {
  return category !== "habit";
}

/** アフィリエイトリンクカード */
export function AffiliateLinks({
  productName,
  category,
}: {
  productName: string;
  category: ReviewCategory;
}) {
  const { isPremium } = useSubscription();

  // プレミアムユーザーは広告非表示
  if (isPremium) return null;
  if (!isShoppable(category)) return null;

  const searchTerm = productName + (CATEGORY_SEARCH_SUFFIX[category] ?? "");

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-b from-surface-card to-surface-card/60 p-4">
      <p className="mb-3 text-xs font-semibold text-content-muted">
        この商品をチェック
      </p>
      <div className="flex gap-2">
        {/* Amazon */}
        <a
          href={amazonSearchUrl(searchTerm)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#FF9900]/10 px-4 py-2.5 text-sm font-medium text-[#FF9900] ring-1 ring-[#FF9900]/20 transition-all duration-200 hover:bg-[#FF9900]/20 hover:shadow-md hover:shadow-[#FF9900]/10"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M.045 18.02c.07-.116.36-.172.53-.076 1.724.985 3.592 1.603 5.55 1.92 2.02.327 4.073.39 6.11.177 1.994-.207 3.93-.727 5.735-1.553.244-.112.48-.23.72-.353.12-.06.24-.13.36-.18.27-.13.46 0 .36.27-.09.25-.2.5-.33.74-.87 1.62-2.03 2.98-3.45 4.06-1.5 1.14-3.19 1.9-5.04 2.28-1.9.39-3.82.37-5.72-.05-1.85-.41-3.53-1.17-5.01-2.3C1.39 21.89.51 20.8.045 19.51c-.06-.15-.07-.34-.05-.49.01-.34.01-.68.05-1z" />
            <path d="M6.29 15.99c-.24.12-.24.3 0 .42.94.49 1.94.88 2.99 1.17 2.13.58 4.32.65 6.48.2 1.04-.22 2.04-.56 2.99-1.02.24-.12.24-.3 0-.42-.94-.49-1.94-.88-2.99-1.17-2.13-.58-4.32-.65-6.48-.2-1.04.22-2.04.56-2.99 1.02z" />
            <path d="M21.72 17.55c.26-.06.47.1.44.36-.18 1.6-1.07 2.82-2.49 3.58-.1.05-.21.1-.33.06-.12-.04-.1-.16-.05-.26.6-.96.86-2 .78-3.12-.02-.28.18-.5.45-.54.4-.06.8-.08 1.2-.08z" />
          </svg>
          Amazon
        </a>

        {/* 楽天 */}
        <a
          href={rakutenSearchUrl(searchTerm)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#BF0000]/10 px-4 py-2.5 text-sm font-medium text-[#E60033] ring-1 ring-[#BF0000]/20 transition-all duration-200 hover:bg-[#BF0000]/20 hover:shadow-md hover:shadow-[#BF0000]/10"
        >
          <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-2h2v2h-2zm0-4v-5h2v5h-2z" />
          </svg>
          楽天市場
        </a>
      </div>
      <p className="mt-2 text-[10px] text-content-muted/50">
        ※ リンク経由の購入で運営を支援できます
      </p>
    </div>
  );
}
