"use client";

import { useState } from "react";
import type { ReviewWithUser } from "@/types";
import { PERIOD_LABELS } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";
import { CategoryBadge, EffectBadge } from "@/components/ui/Badge";
import { AnimatedLikeButton } from "@/components/ui/AnimatedLikeButton";
import { AnimatedBookmarkButton } from "@/components/ui/AnimatedBookmarkButton";

type ReviewCardProps = {
  review: ReviewWithUser;
  onClick?: () => void;
};

export function ReviewCard({ review, onClick }: ReviewCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const validImages = review.imageUrls.filter((u) => u.trim());
  const comparisonCount = review.comparisonItems.length;

  return (
    <article
      onClick={onClick}
      className="card-hover cursor-pointer"
    >
      {/* ヘッダー: ユーザー情報 + カテゴリ */}
      <div className="mb-4 flex items-center gap-3">
        <Avatar name={review.user.nickname} imageUrl={review.user.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-content">{review.user.nickname}</p>
          <p className="text-xs text-content-muted">
            {review.user.ageGroup} · {review.user.sleepDisorderTypes.length > 0 ? review.user.sleepDisorderTypes.join(", ") : "未設定"}
          </p>
        </div>
        <CategoryBadge category={review.category} />
      </div>

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
            <div key={i} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border">
              <img
                src={url}
                alt={`${review.productName} の画像 ${i + 1}`}
                className="h-full w-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              {i === 3 && validImages.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-navy-900/60 text-xs font-medium text-content">
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
          count={review.likesCount + (liked ? 1 : 0)}
          onToggle={() => setLiked(!liked)}
        />

        <button
          type="button"
          onClick={onClick}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-content-muted transition-colors duration-micro hover:bg-surface-elevated hover:text-content-secondary"
          aria-label="コメントを見る"
        >
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {review.commentsCount > 0 ? `${review.commentsCount}件` : "コメントする"}
        </button>

        <div className="flex-1" />

        <AnimatedBookmarkButton
          bookmarked={saved}
          onToggle={() => setSaved(!saved)}
          label={false}
        />
      </div>
    </article>
  );
}
