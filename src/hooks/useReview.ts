"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { mapReviewRow } from "@/lib/mappers";
import { useAuth } from "@/hooks/useAuth";
import type { ReviewWithUser } from "@/types";

/** レビュー詳細データ取得フック */
export function useReview(reviewId: string) {
  const { user: authUser } = useAuth();
  const [review, setReview] = useState<ReviewWithUser | null>(null);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // レビュー + ユーザー情報 + いいね/ブックマーク状態を取得
  const fetchReview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // レビュー + プロフィールを結合取得
      const { data, error: fetchError } = await supabase
        .from("reviews")
        .select("*, profiles(*)")
        .eq("id", reviewId)
        .single();

      if (fetchError) throw fetchError;
      if (!data) throw new Error("レビューが見つかりません");

      setReview(mapReviewRow(data as Record<string, unknown>));

      // ログイン中ならいいね/ブックマーク状態を取得
      if (authUser) {
        const [likeRes, bookmarkRes] = await Promise.all([
          supabase
            .from("likes")
            .select("id")
            .eq("review_id", reviewId)
            .eq("user_id", authUser.id)
            .maybeSingle(),
          supabase
            .from("bookmarks")
            .select("id")
            .eq("review_id", reviewId)
            .eq("user_id", authUser.id)
            .maybeSingle(),
        ]);

        setLiked(!!likeRes.data);
        setBookmarked(!!bookmarkRes.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [reviewId, authUser]);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  /** いいねトグル */
  const toggleLike = useCallback(async () => {
    if (!authUser || !review) return;

    // 楽観的更新
    const wasLiked = liked;
    setLiked(!wasLiked);
    setReview((prev) =>
      prev ? { ...prev, likesCount: prev.likesCount + (wasLiked ? -1 : 1) } : prev,
    );

    try {
      if (wasLiked) {
        await supabase.from("likes").delete().eq("review_id", review.id).eq("user_id", authUser.id);
      } else {
        await supabase.from("likes").insert({ review_id: review.id, user_id: authUser.id });
      }
    } catch {
      // ロールバック
      setLiked(wasLiked);
      setReview((prev) =>
        prev ? { ...prev, likesCount: prev.likesCount + (wasLiked ? 1 : -1) } : prev,
      );
    }
  }, [authUser, review, liked]);

  /** ブックマークトグル */
  const toggleBookmark = useCallback(async () => {
    if (!authUser || !review) return;

    const wasBookmarked = bookmarked;
    setBookmarked(!wasBookmarked);

    try {
      if (wasBookmarked) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("review_id", review.id)
          .eq("user_id", authUser.id);
      } else {
        await supabase.from("bookmarks").insert({ review_id: review.id, user_id: authUser.id });
      }
    } catch {
      setBookmarked(wasBookmarked);
    }
  }, [authUser, review, bookmarked]);

  return {
    review,
    liked,
    bookmarked,
    loading,
    error,
    toggleLike,
    toggleBookmark,
    refetch: fetchReview,
  };
}
