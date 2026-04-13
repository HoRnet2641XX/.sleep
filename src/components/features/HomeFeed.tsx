"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { ReviewCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { ReviewCard } from "@/components/features/ReviewCard";
import { CategoryTabs } from "@/components/features/CategoryTabs";
import { RecommendationCarousel } from "@/components/features/RecommendationCarousel";
import { GreetingHeader, getTimeSlot, getAmbientGradient } from "@/components/features/GreetingHeader";
import { CommunityPulse } from "@/components/features/CommunityPulse";
import { SleepInsightCard } from "@/components/features/SleepInsightCard";
import { JournalWidget } from "@/components/features/JournalWidget";
import { SlideMenu } from "@/components/features/SlideMenu";
import { MatchNotifications } from "@/components/features/MatchNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useCurrentHour } from "@/hooks/useCurrentHour";
import { useSearch } from "@/hooks/useSearch";
import { useFeed, type SortKey } from "@/hooks/useFeed";
import { useInteractions } from "@/hooks/useInteractions";
import { useHomeInsights } from "@/hooks/useHomeInsights";
import { useMatchNotifications } from "@/hooks/useMatchNotifications";

/* ─── トレンドアイコン（SVG） ─── */
const TrendIcon = (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function HomeFeed() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const { user, loading: authLoading, signOut } = useAuth();
  const { recommendations } = useRecommendations();
  const currentHour = useCurrentHour();
  const timeSlot = getTimeSlot(currentHour);

  const [category, setCategory] = useState<ReviewCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("new");
  const [menuOpen, setMenuOpen] = useState(false);

  // 検索
  const search = useSearch();

  // フィード
  const { reviews, setReviews, loading } = useFeed(
    category,
    sortBy,
    user?.id,
    search.isActive,
  );

  // 表示対象のレビュー
  const displayReviews = search.isActive ? search.results : reviews;

  // いいね / ブックマーク
  const { likedIds, savedIds, toggleLike, toggleBookmark } = useInteractions(
    user?.id,
    displayReviews,
    setReviews,
    search.setResults,
  );

  // コミュニティデータ
  const { nickname, activeUsers, insight } = useHomeInsights(user?.id);

  // マッチング通知
  const { notifications: matchNotifications } = useMatchNotifications(user?.id);

  // インサイトにアイコンを注入
  const insightWithIcon = useMemo(
    () => (insight ? { ...insight, icon: TrendIcon } : null),
    [insight],
  );

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.refresh();
  }, [signOut, router]);

  const isLoading = search.isActive ? search.searching : loading;

  const sortTabs: { key: SortKey; label: string; authOnly?: boolean }[] = [
    { key: "new", label: "新着" },
    { key: "popular", label: "人気" },
    { key: "following", label: "フォロー中", authOnly: true },
  ];

  const cardVariants = shouldReduceMotion
    ? {
        hidden: { opacity: 0 },
        visible: () => ({ opacity: 1, transition: { duration: 0.01 } }),
      }
    : {
        hidden: { opacity: 0, y: 24, scale: 0.97 },
        visible: (i: number) => ({
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            delay: i * 0.07,
            duration: 0.45,
            ease: [0.22, 1, 0.36, 1] as const,
          },
        }),
      };

  const ambientBg = useMemo(() => getAmbientGradient(timeSlot), [timeSlot]);

  return (
    <div className="min-h-screen">
      {/* 背景アンビエントグロー（時間帯連動） */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[50vh] transition-all duration-[3000ms]"
        style={{ background: ambientBg }}
      />

      {/* ヘッダー */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto max-w-content px-4 pb-0 pt-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/mascot.svg" alt=".nemuri" className="h-7 w-7" />
              <span className="text-xl font-bold tracking-tight text-content">
                .nemuri
              </span>
            </div>
            <nav className="flex items-center gap-3" aria-label="メインナビゲーション">
              {authLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-surface-elevated" />
              ) : user ? (
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg p-2 text-content-secondary transition-colors hover:bg-surface-elevated hover:text-content"
                  aria-label="メニューを開く"
                  aria-expanded={menuOpen}
                  aria-haspopup="dialog"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
                    <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
                    <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
                  </svg>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20"
                >
                  ログイン
                </Link>
              )}
            </nav>
          </div>

          {/* 検索 */}
          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="relative mb-3"
          >
            <svg className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-content-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="薬、マットレス、習慣を検索..."
              className="input pl-10 pr-10"
              aria-label="レビューを検索"
              value={search.query}
              onChange={(e) => search.setQuery(e.target.value)}
            />
            {search.query && (
              <button
                type="button"
                onClick={() => search.setQuery("")}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-content-muted hover:bg-surface-elevated hover:text-content"
                aria-label="検索をクリア"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </form>

          {!search.isActive && (
            <CategoryTabs selected={category} onChange={setCategory} />
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 mx-auto max-w-content px-4 pb-24 pt-4">
        {/* ── ホーム上部ウィジェット群（検索中は非表示） ── */}
        {!search.isActive && user && (
          <>
            <GreetingHeader nickname={nickname} hour={currentHour} />
            <CommunityPulse count={activeUsers} />
            <JournalWidget userId={user.id} />
          </>
        )}
        {!search.isActive && insightWithIcon && (
          <SleepInsightCard insight={insightWithIcon} />
        )}

        {/* マッチング通知 */}
        {!search.isActive && matchNotifications.length > 0 && (
          <MatchNotifications notifications={matchNotifications} />
        )}

        {/* クイックナビ */}
        {!search.isActive && user && (
          <div className="mb-4 flex gap-2">
            <Link
              href="/ranking"
              className="flex flex-1 items-center gap-2 rounded-lg border border-border/50 bg-surface-card/80 px-4 py-3 text-sm text-content-secondary transition-colors hover:border-primary/20 hover:text-content"
            >
              <svg className="h-4 w-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M8 21h8M12 17v4M6 13l-1.12-7.03A1 1 0 015.87 5h12.26a1 1 0 01.99.97L18 13M6 13h12M6 13l-2 4h16l-2-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              ランキング
            </Link>
            <Link
              href="/dashboard"
              className="flex flex-1 items-center gap-2 rounded-lg border border-border/50 bg-surface-card/80 px-4 py-3 text-sm text-content-secondary transition-colors hover:border-primary/20 hover:text-content"
            >
              <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              睡眠ダッシュボード
            </Link>
          </div>
        )}

        {!search.isActive && recommendations.length > 0 && (
          <RecommendationCarousel recommendations={recommendations} />
        )}

        {/* ── ソートタブ or 検索結果ヘッダー ── */}
        {search.isActive ? (
          <div className="mb-4 pl-1">
            <p className="text-sm text-content-secondary" aria-live="polite">
              {search.searching
                ? "検索中..."
                : `${search.results.length}件の検索結果`}
            </p>
          </div>
        ) : (
          <div className="mb-4 flex gap-4 pl-1" role="tablist" aria-label="並び替え">
            {sortTabs
              .filter((s) => !s.authOnly || user)
              .map((s) => (
                <button
                  key={s.key}
                  type="button"
                  role="tab"
                  aria-selected={sortBy === s.key}
                  onClick={() => setSortBy(s.key)}
                  className={`min-h-[32px] border-b-2 pb-1 text-sm transition-colors duration-micro ${
                    sortBy === s.key
                      ? "border-primary font-semibold text-content"
                      : "border-transparent text-content-muted"
                  }`}
                >
                  {s.label}
                </button>
              ))}
          </div>
        )}

        {/* ── レビューフィード ── */}
        {isLoading ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-surface-elevated" />
                  <div className="h-4 w-24 rounded bg-surface-elevated" />
                </div>
                <div className="h-4 w-48 rounded bg-surface-elevated" />
                <div className="h-3 w-full rounded bg-surface-elevated" />
                <div className="h-3 w-3/4 rounded bg-surface-elevated" />
              </div>
            ))}
          </div>
        ) : displayReviews.length > 0 ? (
          <div className="flex flex-col gap-4">
            {displayReviews.map((review, i) => (
              <motion.div
                key={review.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <ReviewCard
                  review={review}
                  liked={likedIds.has(review.id)}
                  saved={savedIds.has(review.id)}
                  onToggleLike={() => toggleLike(review.id)}
                  onToggleSave={() => toggleBookmark(review.id)}
                  onClick={() => router.push(`/review/${review.id}`)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            isSearching={search.isActive}
            sortBy={sortBy}
            user={!!user}
            onSwitchToPopular={() => setSortBy("popular")}
            onSelectCategory={(cat) => {
              setCategory(cat);
              setSortBy("popular");
            }}
          />
        )}
      </main>

      {/* 投稿 FAB */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Link
          href={user ? "/post" : "/login"}
          className="fixed bottom-6 right-6 z-10 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-lavender-400 text-white shadow-lg shadow-primary/30 transition-transform duration-micro hover:scale-105"
          aria-label="レビューを投稿する"
        >
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </Link>
      </motion.div>

      {/* スライドメニュー */}
      {user && (
        <SlideMenu
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          userId={user.id}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}

/* ──��� 空状態コンポーネント ─── */
function EmptyState({
  isSearching,
  sortBy,
  user,
  onSwitchToPopular,
  onSelectCategory,
}: {
  isSearching: boolean;
  sortBy: SortKey;
  user: boolean;
  onSwitchToPopular: () => void;
  onSelectCategory: (cat: ReviewCategory) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="py-12 text-center"
    >
      {isSearching ? (
        <div className="rounded-xl border border-border/40 bg-surface-card/50 px-6 py-8">
          <svg className="mx-auto mb-4 h-12 w-12 text-content-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <p className="mb-2 font-medium text-content">見つかりませんでした</p>
          <p className="text-sm text-content-secondary">
            別のキーワードで検索してみてください
          </p>
        </div>
      ) : sortBy === "following" ? (
        <div className="rounded-xl border border-border/40 bg-surface-card/50 px-6 py-8">
          <svg className="mx-auto mb-4 h-12 w-12 text-content-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="19" y1="8" x2="19" y2="14" strokeLinecap="round" />
            <line x1="22" y1="11" x2="16" y2="11" strokeLinecap="round" />
          </svg>
          <p className="mb-2 font-medium text-content">
            まだ誰もフォローしていません
          </p>
          <p className="mb-4 text-sm text-content-secondary">
            気になる���ビュアーをフォローすると、ここに表示されます
          </p>
          <button
            type="button"
            onClick={onSwitchToPopular}
            className="btn-secondary text-sm"
          >
            人気のレビューを見る
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-border/40 bg-gradient-to-br from-surface-card to-surface-elevated px-6 py-8">
          <img
            src="/mascot.svg"
            alt=""
            className="mx-auto mb-4 h-16 w-16 opacity-60"
            aria-hidden="true"
          />
          <p className="mb-2 text-lg font-bold text-content">
            静かな夜を、一緒に過ごしましょう
          </p>
          <p className="mb-5 text-sm leading-relaxed text-content-secondary">
            あなたの眠りの経験が、誰かの夜を変えるかもしれません。
            <br />
            最初のレビューを書いてみませんか？
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link
              href={user ? "/post" : "/login"}
              className="btn-primary w-full max-w-[240px] text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
                <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
              </svg>
              レビューを書く
            </Link>
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {(["medicine", "mattress", "pillow", "habit"] as const).map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onSelectCategory(cat)}
                    className="rounded-full border border-border/60 bg-surface-elevated/50 px-3 py-1.5 text-xs text-content-secondary transition-colors hover:border-primary/30 hover:text-content"
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
