"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { ReviewCategory, ReviewWithUser, SleepDisorderType, ComparisonItem } from "@/types";
import { ReviewCard } from "@/components/features/ReviewCard";
import { CategoryTabs } from "@/components/features/CategoryTabs";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { EffectLevel, UsagePeriod } from "@/types";

type SortKey = "new" | "popular";

/** DB行 → ReviewWithUser への変換 */
function mapRow(row: Record<string, unknown>): ReviewWithUser {
  const profile = row.profiles as Record<string, unknown>;
  return {
    id: row.id as string,
    userId: row.user_id as string,
    category: row.category as ReviewCategory,
    productName: row.product_name as string,
    rating: row.rating as number,
    effectLevel: row.effect_level as EffectLevel,
    usagePeriod: row.usage_period as UsagePeriod,
    body: row.body as string,
    imageUrls: (row.image_urls as string[]) ?? [],
    referenceUrl: (row.reference_url as string) ?? null,
    comparisonItems: (row.comparison_items as ComparisonItem[]) ?? [],
    likesCount: row.likes_count as number,
    commentsCount: row.comments_count as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    user: {
      id: profile.id as string,
      nickname: profile.nickname as string,
      avatarUrl: (profile.avatar_url as string) ?? null,
      height: (profile.height as number) ?? null,
      weight: (profile.weight as number) ?? null,
      gender: (profile.gender as ReviewWithUser["user"]["gender"]) ?? null,
      ageGroup: (profile.age_group as string) ?? null,
      sleepDisorderTypes: (profile.sleep_disorder_types as SleepDisorderType[]) ?? [],
      cause: (profile.cause as string) ?? null,
      createdAt: profile.created_at as string,
      updatedAt: profile.updated_at as string,
    },
  };
}

/** スライドメニュー */
function SlideMenu({
  open,
  onClose,
  userId,
  onSignOut,
}: {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSignOut: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-navy-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* パネル */}
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-72 border-l border-border bg-surface-card"
            aria-label="ユーザーメニュー"
          >
            <div className="flex h-full flex-col">
              {/* メニューヘッダー */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <span className="text-sm font-semibold text-content">メニュー</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-1 text-content-muted hover:bg-surface-elevated hover:text-content"
                  aria-label="メニューを閉じる"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              {/* メニューリンク */}
              <div className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                  <li>
                    <Link
                      href={`/profile/${userId}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-content-secondary transition-colors hover:bg-surface-elevated hover:text-content"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      マイページ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/profile/edit`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-content-secondary transition-colors hover:bg-surface-elevated hover:text-content"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      プロフィール編集
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/post"
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-content-secondary transition-colors hover:bg-surface-elevated hover:text-content"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" />
                        <line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" />
                      </svg>
                      レビューを書く
                    </Link>
                  </li>
                </ul>
              </div>

              {/* ログアウト */}
              <div className="border-t border-border px-3 py-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-content-muted transition-colors hover:bg-surface-elevated hover:text-error"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" />
                    <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  ログアウト
                </button>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}

/** カードのスタガーアニメーション */
const cardVariants = {
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

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [category, setCategory] = useState<ReviewCategory | "all">("all");
  const [sortBy, setSortBy] = useState<SortKey>("new");
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  /** レビュー一覧を取得 */
  const fetchReviews = useCallback(async () => {
    setLoading(true);

    let query = supabase.from("reviews").select("*, profiles(*)");

    if (category !== "all") {
      query = query.eq("category", category);
    }

    if (sortBy === "popular") {
      query = query.order("likes_count", { ascending: false });
    } else {
      query = query.order("created_at", { ascending: false });
    }

    query = query.limit(50);

    const { data } = await query;
    const mapped = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
    setReviews(mapped);
    setLoading(false);
  }, [category, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    router.refresh();
  }, [signOut, router]);

  return (
    <div className="min-h-screen">
      {/* 背景のアンビエントグロー */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[40vh]"
        style={{
          background:
            "radial-gradient(ellipse at 30% 0%, rgba(169,143,216,0.03) 0%, transparent 60%), radial-gradient(ellipse at 70% 10%, rgba(245,184,61,0.02) 0%, transparent 50%)",
        }}
      />

      {/* ヘッダー */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto max-w-content px-4 pb-0 pt-3">
          {/* ロゴ + ナビゲーション */}
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="#F5B83D" strokeWidth="1.5" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="rgba(245,184,61,0.12)" />
              </svg>
              <span className="text-xl font-bold tracking-tight text-content">.sleep</span>
            </div>

            {/* 右側ナビ */}
            <nav className="flex items-center gap-3" aria-label="メインナビゲーション">
              {authLoading ? (
                <div className="h-8 w-16 animate-pulse rounded bg-surface-elevated" />
              ) : user ? (
                <button
                  type="button"
                  onClick={() => setMenuOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg p-2 text-content-secondary transition-colors hover:bg-surface-elevated hover:text-content"
                  aria-label="メニューを開く"
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
          <div className="relative mb-3">
            <svg className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-content-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="薬、マットレス、習慣を検索..."
              className="input pl-10"
              aria-label="レビューを検索"
            />
          </div>

          {/* カテゴリタブ */}
          <CategoryTabs selected={category} onChange={setCategory} />
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative z-10 mx-auto max-w-content px-4 pb-24 pt-4">
        {/* ソート */}
        <div className="mb-4 flex gap-4 pl-1">
          {([
            { key: "new" as const, label: "新着" },
            { key: "popular" as const, label: "人気" },
          ]).map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSortBy(s.key)}
              className={`border-b-2 pb-1 text-sm transition-colors duration-micro ${
                sortBy === s.key
                  ? "border-primary font-semibold text-content"
                  : "border-transparent text-content-muted"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* レビューフィード */}
        {loading ? (
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
        ) : reviews.length > 0 ? (
          <div className="flex flex-col gap-4">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <ReviewCard
                  review={review}
                  onClick={() => router.push(`/review/${review.id}`)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="py-16 text-center text-content-muted"
          >
            <svg className="mx-auto mb-3 h-12 w-12 text-content-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            <p className="mb-2 font-medium">まだレビューがありません</p>
            <p className="text-sm">最初のレビューを投稿してみませんか？</p>
          </motion.div>
        )}
      </main>

      {/* 投稿FAB */}
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
