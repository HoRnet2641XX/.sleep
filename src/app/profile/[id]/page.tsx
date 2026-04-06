"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useFollow, useFollowCounts } from "@/hooks/useFollow";
import { ProfileHeader } from "@/components/features/ProfileHeader";
import { BodyInfoCard } from "@/components/features/BodyInfoCard";
import { SleepInfoCard } from "@/components/features/SleepInfoCard";
import { FollowButton } from "@/components/ui/FollowButton";
import { CategoryBadge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import type { Review } from "@/types";

/** プロフィールスケルトン */
function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-content px-4 py-6 space-y-6" aria-busy="true" aria-label="読み込み中">
      <div className="flex flex-col items-center gap-3">
        <div className="h-12 w-12 animate-pulse rounded-full bg-surface-elevated" />
        <div className="h-5 w-28 animate-pulse rounded bg-surface-elevated" />
      </div>
      <div className="h-20 animate-pulse rounded-lg bg-surface-card" />
      <div className="h-32 animate-pulse rounded-lg bg-surface-card" />
      <div className="h-24 animate-pulse rounded-lg bg-surface-card" />
    </div>
  );
}

/** レビュー一覧のコンパクト表示 */
function ReviewListItem({ review }: { review: Review }) {
  return (
    <li>
      <Link
        href={`/review/${review.id}`}
        className="flex items-center gap-3 rounded-lg border border-border bg-surface-card px-4 py-3 transition-colors duration-micro hover:border-border-light"
      >
        <CategoryBadge category={review.category} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-content">{review.productName}</p>
        </div>
        <StarRating rating={review.rating} size="sm" />
      </Link>
    </li>
  );
}

/** プロフィール閲覧ページ */
export default function ProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { profile, reviews, totalLikes, isOwnProfile, loading, error } =
    useProfile(params.id);
  const { isFollowing, loading: followLoading, toggleFollow } = useFollow(params.id);
  const { followersCount, followingCount } = useFollowCounts(params.id);

  return (
    <>
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-lg">
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
          <h1 className="text-base font-semibold text-content">プロフィール</h1>
          {isOwnProfile ? (
            <Link
              href="/profile/edit"
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              編集
            </Link>
          ) : (
            <div className="w-8" aria-hidden="true" />
          )}
        </div>
      </header>

      {/* コンテンツ */}
      {loading ? (
        <ProfileSkeleton />
      ) : error ? (
        <div className="mx-auto max-w-content px-4 py-8">
          <p className="text-center text-sm text-error" role="alert">{error}</p>
        </div>
      ) : profile ? (
        <main className="mx-auto max-w-content px-4 py-6">
          <div className="space-y-6">
            <ProfileHeader
              profile={profile}
              reviewCount={reviews.length}
              totalLikes={totalLikes}
              followersCount={followersCount}
              followingCount={followingCount}
            />
            {!isOwnProfile && (
              <div className="flex justify-center">
                <FollowButton
                  isFollowing={isFollowing}
                  loading={followLoading}
                  onToggle={toggleFollow}
                />
              </div>
            )}
            <BodyInfoCard profile={profile} />
            <SleepInfoCard profile={profile} />

            {/* レビュー一覧 */}
            <section aria-label="投稿したレビュー">
              <h3 className="mb-4 text-sm font-semibold text-content-muted">
                レビュー ({reviews.length})
              </h3>
              {reviews.length > 0 ? (
                <ul className="space-y-3">
                  {reviews.map((review) => (
                    <ReviewListItem key={review.id} review={review} />
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-content-muted">
                  まだレビューはありません
                </p>
              )}
            </section>
          </div>
        </main>
      ) : null}
    </>
  );
}
