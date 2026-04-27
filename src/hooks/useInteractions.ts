"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { ReviewWithUser } from "@/types";
import { PLANS } from "@/types";
import { useSubscription } from "@/hooks/useSubscription";

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

  // ID の join 文字列を安定キーにして無限ループを防ぐ
  const displayReviewIds = useMemo(
    () => displayReviews.map((r) => r.id),
    [displayReviews],
  );
  const displayReviewKey = displayReviewIds.join(",");

  useEffect(() => {
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
      setLikedIds(
        new Set((likeRes.data ?? []).map((r) => r.review_id as string)),
      );
      setSavedIds(
        new Set((bookmarkRes.data ?? []).map((r) => r.review_id as string)),
      );
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, displayReviewKey]);

  /** いいねトグル */
  const toggleLike = useCallback(
    async (reviewId: string) => {
      if (!userId) {
        router.push("/login");
        return;
      }
      const wasLiked = likedIds.has(reviewId);
      setLikedIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) next.delete(reviewId);
        else next.add(reviewId);
        return next;
      });
      const delta = wasLiked ? -1 : 1;
      const updater = (list: ReviewWithUser[]) =>
        list.map((r) =>
          r.id === reviewId ? { ...r, likesCount: r.likesCount + delta } : r,
        );
      setReviews(updater);
      setSearchResults(updater);

      try {
        if (wasLiked) {
          await supabase
            .from("likes")
            .delete()
            .eq("review_id", reviewId)
            .eq("user_id", userId);
        } else {
          await supabase
            .from("likes")
            .insert({ review_id: reviewId, user_id: userId });
        }
      } catch {
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (wasLiked) next.add(reviewId);
          else next.delete(reviewId);
          return next;
        });
        const revert = (list: ReviewWithUser[]) =>
          list.map((r) =>
            r.id === reviewId
              ? { ...r, likesCount: r.likesCount - delta }
              : r,
          );
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
          setBookmarkLimitError(
            `ブックマークは${limit}件まで（プレミアムで無制限）`,
          );
          setTimeout(() => setBookmarkLimitError(null), 4000);
          return;
        }
      }

      setSavedIds((prev) => {
        const next = new Set(prev);
        if (wasSaved) next.delete(reviewId);
        else next.add(reviewId);
        return next;
      });
      try {
        if (wasSaved) {
          await supabase
            .from("bookmarks")
            .delete()
            .eq("review_id", reviewId)
            .eq("user_id", userId);
          setTotalBookmarks((n) => Math.max(0, n - 1));
        } else {
          await supabase
            .from("bookmarks")
            .insert({ review_id: reviewId, user_id: userId });
          setTotalBookmarks((n) => n + 1);
        }
      } catch {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (wasSaved) next.add(reviewId);
          else next.delete(reviewId);
          return next;
        });
      }
    },
    [userId, savedIds, router, isPremium, totalBookmarks],
  );

  return { likedIds, savedIds, toggleLike, toggleBookmark, bookmarkLimitError, totalBookmarks };
}
