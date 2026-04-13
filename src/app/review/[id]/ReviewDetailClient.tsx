"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useReview } from "@/hooks/useReview";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/Avatar";
import { StarRating } from "@/components/ui/StarRating";
import { CategoryBadge, EffectBadge } from "@/components/ui/Badge";
import { MedicalDisclaimer } from "@/components/features/MedicalDisclaimer";
import { CommentSection } from "@/components/features/CommentSection";
import { CommentInput } from "@/components/features/CommentInput";
import { AnimatedLikeButton } from "@/components/ui/AnimatedLikeButton";
import { AnimatedBookmarkButton } from "@/components/ui/AnimatedBookmarkButton";
import { ShareButtons } from "@/components/ui/ShareButtons";
import { PERIOD_LABELS, SLEEP_DISORDER_LABELS } from "@/types";
import type { SleepDisorderType } from "@/types";

/** 相対時間を計算 */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  const months = Math.floor(days / 30);
  return `${months}ヶ月前`;
}

/** ローディングスケルトン */
function ReviewSkeleton() {
  return (
    <div className="mx-auto max-w-content px-4 py-6" aria-busy="true" aria-label="読み込み中">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-full bg-surface-elevated" />
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-surface-elevated" />
            <div className="h-3 w-36 animate-pulse rounded bg-surface-elevated" />
          </div>
        </div>
        <div className="h-6 w-48 animate-pulse rounded bg-surface-elevated" />
        <div className="h-4 w-32 animate-pulse rounded bg-surface-elevated" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-surface-elevated" />
          <div className="h-3 w-full animate-pulse rounded bg-surface-elevated" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-surface-elevated" />
        </div>
      </div>
    </div>
  );
}

/** 画像ライトボックス */
function ImageLightbox({
  images,
  index,
  onClose,
}: {
  images: string[];
  index: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(index);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.img
        key={current}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        src={images[current]}
        alt={`画像 ${current + 1}`}
        className="max-h-[80vh] max-w-[90vw] rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      {/* ナビゲーション */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((prev) => (prev - 1 + images.length) % images.length);
            }}
            className="absolute left-4 rounded-full bg-navy-800/80 p-2 text-content hover:bg-navy-700"
            aria-label="前の画像"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((prev) => (prev + 1) % images.length);
            }}
            className="absolute right-4 rounded-full bg-navy-800/80 p-2 text-content hover:bg-navy-700"
            aria-label="次の画像"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      )}

      {/* 閉じる */}
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-navy-800/80 p-2 text-content hover:bg-navy-700"
        aria-label="閉じる"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* インジケータ */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-4 bg-primary" : "w-1.5 bg-content-muted"
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

/** レビュー詳細クライアントコンポーネント */
export default function ReviewDetailClient({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const { user: authUser } = useAuth();
  const {
    review,
    liked,
    bookmarked,
    loading: reviewLoading,
    error: reviewError,
    toggleLike,
    toggleBookmark,
  } = useReview(reviewId);
  const {
    comments,
    loading: commentsLoading,
    submitting: commentSubmitting,
    addComment,
  } = useComments(reviewId);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const commentSectionRef = useRef<HTMLDivElement>(null);

  const validImages = review?.imageUrls.filter((u) => u.trim()) ?? [];

  const scrollToComments = () => {
    commentSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      {/* ヘッダー */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-lg"
      >
        <div className="mx-auto flex max-w-content items-center justify-between px-4 py-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center text-content-secondary hover:text-content"
            aria-label="前のページに戻る"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-base font-semibold text-content">レビュー詳細</h1>
          <div className="w-5" aria-hidden="true" />
        </div>
      </motion.header>

      {/* メインコンテンツ */}
      {reviewLoading ? (
        <ReviewSkeleton />
      ) : reviewError ? (
        <div className="mx-auto max-w-content px-4 py-8">
          <p className="text-center text-sm text-error" role="alert">
            {reviewError}
          </p>
        </div>
      ) : review ? (
        <main className="mx-auto max-w-content px-4 py-6">
          <div className="space-y-6">
            {/* 1. 投稿者情報 */}
            <motion.section
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-3"
              aria-label="投稿者情報"
            >
              <Link href={`/profile/${review.userId}`}>
                <Avatar
                  name={review.user.nickname}
                  imageUrl={review.user.avatarUrl}
                  size="lg"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${review.userId}`}
                  className="text-base font-semibold text-content hover:underline"
                >
                  {review.user.nickname}
                </Link>
                <p className="text-xs text-content-muted">
                  {[
                    review.user.ageGroup,
                    ...review.user.sleepDisorderTypes.map(
                      (t: SleepDisorderType) => SLEEP_DISORDER_LABELS[t],
                    ),
                  ]
                    .filter(Boolean)
                    .join(" · ") || "プロフィール未設定"}
                </p>
                <time className="text-xs text-content-muted" dateTime={review.createdAt}>
                  {timeAgo(review.createdAt)}
                </time>
              </div>
            </motion.section>

            {/* 2. カテゴリ + 製品名 */}
            <motion.section custom={1} variants={fadeUp} initial="hidden" animate="visible">
              <div className="mb-2">
                <CategoryBadge category={review.category} />
              </div>
              <h2 className="text-2xl font-bold text-content">{review.productName}</h2>
            </motion.section>

            {/* 3. 評価メタ */}
            <motion.section
              custom={2}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="border-y border-border py-4"
              aria-label="評価情報"
            >
              <div className="flex flex-wrap items-center gap-3">
                <StarRating rating={review.rating} size="md" />
                <EffectBadge effect={review.effectLevel} />
                <span className="text-sm text-content-muted">
                  {PERIOD_LABELS[review.usagePeriod]}使用
                </span>
              </div>
            </motion.section>

            {/* 4. 画像ギャラリー */}
            {validImages.length > 0 && (
              <motion.section
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                aria-label="画像"
              >
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {validImages.map((url, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setLightboxIndex(i)}
                      className="group relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border border-border transition-all duration-micro hover:border-primary/40"
                    >
                      <img
                        src={url}
                        alt={`${review.productName} の画像 ${i + 1}`}
                        className="h-full w-full object-cover transition-transform duration-normal group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </button>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 5. 本文 */}
            <motion.section custom={4} variants={fadeUp} initial="hidden" animate="visible" aria-label="レビュー本文">
              <p className="whitespace-pre-line text-sm leading-relaxed text-content-secondary">
                {review.body}
              </p>
            </motion.section>

            {/* 6. 参考URL */}
            {review.referenceUrl && (
              <motion.section custom={5} variants={fadeUp} initial="hidden" animate="visible">
                <a
                  href={review.referenceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-border bg-surface-card px-4 py-3 text-sm text-info transition-colors duration-micro hover:border-info/40 hover:bg-info/5"
                >
                  <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="min-w-0 truncate">{review.referenceUrl}</span>
                  <svg className="h-3.5 w-3.5 shrink-0 text-content-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </motion.section>
            )}

            {/* 7. 比較テーブル */}
            {review.comparisonItems.length > 0 && (
              <motion.section
                custom={6}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                aria-label="他の商品との比較"
              >
                <h3 className="mb-3 text-sm font-semibold text-content">
                  <svg className="mr-1.5 inline h-4 w-4 text-lavender-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  他の商品との比較
                </h3>
                <div className="space-y-2">
                  {review.comparisonItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-lg border border-border bg-surface-card px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-content">{item.name}</p>
                        {item.note && (
                          <p className="mt-0.5 text-xs text-content-muted">{item.note}</p>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {item.price != null && (
                          <span className="text-xs text-content-muted">
                            {item.price.toLocaleString()}円
                          </span>
                        )}
                        <StarRating rating={item.rating} size="sm" />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 8. 医薬品の免責表示 */}
            {review.category === "medicine" && <MedicalDisclaimer />}

            {/* 9. アクションバー */}
            <motion.section
              custom={7}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-4 border-t border-border pt-4"
              aria-label="アクション"
            >
              <AnimatedLikeButton
                liked={liked}
                count={review.likesCount}
                onToggle={toggleLike}
                disabled={!authUser}
              />

              {/* コメントへスクロールボタン */}
              <button
                type="button"
                onClick={scrollToComments}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-content-secondary transition-colors duration-micro hover:bg-surface-elevated"
              >
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                {comments.length > 0 ? `${comments.length}件` : "コメントする"}
              </button>

              <div className="flex-1" />

              <AnimatedBookmarkButton
                bookmarked={bookmarked}
                onToggle={toggleBookmark}
                disabled={!authUser}
              />
            </motion.section>

            {/* 9.5. SNS共有 */}
            <motion.section
              custom={7.5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="flex items-center justify-between border-t border-border pt-4"
              aria-label="共有"
            >
              <span className="text-xs font-medium text-content-muted">
                このレビューを共有
              </span>
              <ShareButtons
                title={`${review.productName} のレビュー`}
                text={`${review.body.slice(0, 60)}${review.body.length > 60 ? "…" : ""}`}
                url={typeof window !== "undefined" ? window.location.href : ""}
              />
            </motion.section>

            {/* 10. コメントセクション */}
            <motion.section
              ref={commentSectionRef}
              custom={8}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              aria-label="コメント"
              className="scroll-mt-16 pb-24"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-content">
                  <svg className="mr-1.5 inline h-4 w-4 text-content-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  コメント ({comments.length})
                </h3>
              </div>
              <CommentSection comments={comments} loading={commentsLoading} />
            </motion.section>
          </div>
        </main>
      ) : null}

      {/* スティッキーボトムバー: コメント入力 */}
      {review && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-surface/95 backdrop-blur-lg"
        >
          <div className="mx-auto max-w-content px-4 py-3">
            <CommentInput onSubmit={addComment} submitting={commentSubmitting} />
          </div>
        </motion.div>
      )}

      {/* ライトボックス */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <ImageLightbox
            images={validImages}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
