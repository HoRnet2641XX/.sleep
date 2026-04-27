"use client";

import { useState } from "react";
import Image from "next/image";
import type { ReviewWithUser } from "@/types";
import { PERIOD_LABELS } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";
import { CategoryBadge, EffectBadge } from "@/components/ui/Badge";
import { AnimatedLikeButton } from "@/components/ui/AnimatedLikeButton";
import { AnimatedBookmarkButton } from "@/components/ui/AnimatedBookmarkButton";
import { AnimatedCommentButton } from "@/components/ui/AnimatedCommentButton";
import { ReportDialog } from "@/components/features/ReportDialog";

type ReviewCardProps = {
  review: ReviewWithUser;
  onClick?: () => void;
  liked: boolean;
  saved: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
};

export function ReviewCard({
  review,
  onClick,
  liked,
  saved,
  onToggleLike,
  onToggleSave,
}: ReviewCardProps) {
  const validImages = review.imageUrls.filter((u) => u.trim());
  const comparisonCount = review.comparisonItems.length;
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <article
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "link" : undefined}
      aria-label={onClick ? `${review.productName} のレビュー詳細を開く` : undefined}
      className="card-hover cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* ヘッダー: ユーザー情報 + カテゴリ + メニュー */}
      <div className="mb-4 flex items-center gap-3">
        <Avatar name={review.user.nickname} imageUrl={review.user.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-content">{review.user.nickname}</p>
          <p className="text-xs text-content-muted">
            {review.user.ageGroup} · {review.user.sleepDisorderTypes.length > 0 ? review.user.sleepDisorderTypes.join(", ") : "未設定"}
          </p>
        </div>
        <CategoryBadge category={review.category} />

        {/* オーバーフローメニュー */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-content-muted transition-colors hover:bg-surface-elevated hover:text-content"
            aria-label="その他のメニュー"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="fixed inset-0 z-30 cursor-default"
                aria-label="メニューを閉じる"
              />
              <div
                className="absolute right-0 top-full z-40 mt-1 w-40 overflow-hidden rounded-lg border border-border bg-surface-card shadow-xl"
                role="menu"
              >
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setReportOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-content-secondary hover:bg-surface-elevated hover:text-error"
                  role="menuitem"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  通報する
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <ReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        targetType="review"
        targetId={review.id}
      />

      {/* 製品名 */}
      <h3 className="mb-2 text-base font-bold leading-snug text-content">
        {review.productName}
      </h3>

      {/* 評価 + 効果 + 期間 */}
      <div className="mb-3 flex items-center gap-3">
        <StarRating rating={review.rating} />
        <EffectBadge effect={review.effectLevel} />
        <span className="text-xs text-content-muted">
          {PERIOD_LABELS[review.usagePeriod]}
        </span>
      </div>

      {/* 本文（3行で省略） */}
      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-content-secondary">
        {review.body}
      </p>

      {/* 画像サムネイル */}
      {validImages.length > 0 && (
        <div className="mb-4 flex gap-2 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
          {validImages.slice(0, 4).map((url, i) => (
            <div key={i} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-elevated">
              <Image
                src={url}
                alt={`${review.productName} の画像 ${i + 1}`}
                fill
                sizes="64px"
                loading="lazy"
                unoptimized
                className="object-cover"
              />
              {i === 3 && validImages.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-surface/70 text-xs font-medium text-content">
                  +{validImages.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* メタ情報バッジ（参考URL・比較） */}
      {(review.referenceUrl || comparisonCount > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {review.referenceUrl && (
            <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-2.5 py-0.5 text-xs font-medium text-info">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              参考リンク
            </span>
          )}
          {comparisonCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-lavender-400/10 px-2.5 py-0.5 text-xs font-medium text-lavender-400">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {comparisonCount}件の比較
            </span>
          )}
        </div>
      )}

      {/* アクション: いいね・コメント・保存 */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <AnimatedLikeButton
          liked={liked}
          count={review.likesCount}
          onToggle={onToggleLike}
        />

        <AnimatedCommentButton
          count={review.commentsCount}
          onClick={() => onClick?.()}
        />

        <div className="flex-1" />

        <AnimatedBookmarkButton
          bookmarked={saved}
          onToggle={onToggleSave}
          label={false}
        />
      </div>
    </article>
  );
}
