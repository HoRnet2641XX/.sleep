"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ReviewWithUser } from "@/types";
import { PLANS } from "@/types";
import { useSubscription } from "@/hooks/useSubscription";

function updateIdMembership(ids: Set<string>, id: string, shouldInclude: boolean): Set<string> {
  const next = new Set(ids);
  if (shouldInclude) next.add(id);
  else next.delete(id);
  return next;
}

function withLikeDelta(reviewId: string, delta: number) {
  return (list: ReviewWithUser[]) =>
    list.map((review) =>
      review.id === reviewId ? { ...review, likesCount: review.likesCount + delta } : review,
    );
}

/**
 * レビューリストに対する like / bookmark の状態管理。
 * 楽観的更新 + ロールバック付き。
 * フリープランはブックマーク上限あり (PLANS.free.limits.bookmarks)。
 */
export function useInteractions(
  userId: string | undefined,
  displayReviews: ReviewWithUser[],
  setReviews: React.Dispatch<React.SetStateAction<ReviewWithUser[]>>,
  setSearchResults: React.Dispatch<React.SetStateAction<ReviewWithUser[]>>,
) {
  const router = useRouter();
  const { isPremium } = useSubscription();
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [totalBookmarks, setTotalBookmarks] = useState<number>(0);
  const [bookmarkLimitError, setBookmarkLimitError] = useState<string | null>(null);

  // 総ブックマーク数を取得（上限チェック用）
  useEffect(() => {
    if (!userId) {
      setTotalBookmarks(0);
      return;
    }
    (async () => {
      const { count } = await supabase
        .from("bookmarks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      setTotalBookmarks(count ?? 0);
    })();
  }, [userId]);

  const displayReviewKey = useMemo(
    () => displayReviews.map((review) => review.id).join(","),
    [displayReviews],
  );

  useEffect(() => {
    const displayReviewIds = displayReviewKey ? displayReviewKey.split(",") : [];

    if (!userId || displayReviewIds.length === 0) {
      setLikedIds(new Set());
      setSavedIds(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      const [likeRes, bookmarkRes] = await Promise.all([
        supabase
          .from("likes")
          .select("review_id")
          .eq("user_id", userId)
          .in("review_id", displayReviewIds),
        supabase
          .from("bookmarks")
          .select("review_id")
          .eq("user_id", userId)
          .in("review_id", displayReviewIds),
      ]);
      if (cancelled) return;
      setLikedIds(new Set((likeRes.data ?? []).map((r) => r.review_id as string)));
      setSavedIds(new Set((bookmarkRes.data ?? []).map((r) => r.review_id as string)));
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, displayReviewKey]);

  /** いいねトグル */
  const toggleLike = useCallback(
    async (reviewId: string) => {
      if (!userId) {
        router.push("/login");
        return;
      }
      const wasLiked = likedIds.has(reviewId);
      setLikedIds((prev) => updateIdMembership(prev, reviewId, !wasLiked));
      const delta = wasLiked ? -1 : 1;
      const updater = withLikeDelta(reviewId, delta);
      setReviews(updater);
      setSearchResults(updater);

      try {
        if (wasLiked) {
          await supabase.from("likes").delete().eq("review_id", reviewId).eq("user_id", userId);
        } else {
          await supabase.from("likes").insert({ review_id: reviewId, user_id: userId });
        }
      } catch {
        setLikedIds((prev) => updateIdMembership(prev, reviewId, wasLiked));
        const revert = withLikeDelta(reviewId, -delta);
        setReviews(revert);
        setSearchResults(revert);
      }
    },
    [userId, likedIds, router, setReviews, setSearchResults],
  );

  /** ブックマークトグル */
  const toggleBookmark = useCallback(
    async (reviewId: string) => {
      if (!userId) {
        router.push("/login");
        return;
      }
      const wasSaved = savedIds.has(reviewId);

      // フリープランの上限チェック（新規追加のみ）
      if (!wasSaved && !isPremium) {
        const limit = PLANS.free.limits.bookmarks;
        if (totalBookmarks >= limit) {
          setBookmarkLimitError(`ブックマークは${limit}件まで（プレミアムで無制限）`);
          setTimeout(() => setBookmarkLimitError(null), 4000);
          return;
        }
      }

      setSavedIds((prev) => updateIdMembership(prev, reviewId, !wasSaved));
      try {
        if (wasSaved) {
          await supabase.from("bookmarks").delete().eq("review_id", reviewId).eq("user_id", userId);
          setTotalBookmarks((n) => Math.max(0, n - 1));
        } else {
          await supabase.from("bookmarks").insert({ review_id: reviewId, user_id: userId });
          setTotalBookmarks((n) => n + 1);
        }
      } catch {
        setSavedIds((prev) => updateIdMembership(prev, reviewId, wasSaved));
      }
    },
    [userId, savedIds, router, isPremium, totalBookmarks],
  );

  return {
    likedIds,
    savedIds,
    toggleLike,
    toggleBookmark,
    bookmarkLimitError,
    totalBookmarks,
  };
}
