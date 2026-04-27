"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/features/AuthGuard";
import { ReviewCard } from "@/components/features/ReviewCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { mapReviewRow } from "@/lib/mapReview";
import type { ReviewWithUser } from "@/types";

function BookmarksContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      /* bookmarks → reviews JOIN */
      const { data } = await supabase
        .from("bookmarks")
        .select("created_at, reviews!inner(*, profiles(*))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (cancelled) return;
      const rows = (data ?? [])
        .map((b) => b.reviews as Record<string, unknown> | null)
        .filter(Boolean) as Record<string, unknown>[];
      setReviews(rows.map((r) => mapReviewRow(r)));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="min-h-screen">
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
          <h1 className="text-lg font-bold text-content">ブックマーク</h1>
        </div>
      </header>

      <main className="mx-auto max-w-content px-4 pb-24 pt-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-32" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-border/40 bg-surface-card/50 px-6 py-12 text-center">
            <svg className="mx-auto mb-4 h-12 w-12 text-content-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mb-2 text-sm font-medium text-content">
              まだブックマークがありません
            </p>
            <p className="text-xs text-content-secondary">
              気になるレビューを保存すると、ここに表示されます
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-lg bg-primary/15 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/25"
            >
              レビューを探す
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <ReviewCard
                  review={review}
                  onClick={() => router.push(`/review/${review.id}`)}
                  liked={false}
                  saved={true}
                  onToggleLike={() => {}}
                  onToggleSave={() => {}}
                />
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function BookmarksPage() {
  return (
    <AuthGuard>
      <BookmarksContent />
    </AuthGuard>
  );
}
