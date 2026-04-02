"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { ReviewWithUser, ReviewCategory, EffectLevel, UsagePeriod, SleepDisorderType, ComparisonItem } from "@/types";

/** DB行 → フロント型への変換 */
function mapReview(row: Record<string, unknown>, user: Record<string, unknown>): ReviewWithUser {
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
      id: user.id as string,
      nickname: user.nickname as string,
      avatarUrl: (user.avatar_url as string) ?? null,
      height: (user.height as number) ?? null,
      weight: (user.weight as number) ?? null,
      gender: (user.gender as ReviewWithUser["user"]["gender"]) ?? null,
      ageGroup: (user.age_group as string) ?? null,
      sleepDisorderTypes: (user.sleep_disorder_types as SleepDisorderType[]) ?? [],
      cause: (user.cause as string) ?? null,
      createdAt: user.created_at as string,
      updatedAt: user.updated_at as string,
    },
  };
}

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

      const profile = data.profiles as Record<string, unknown>;
      setReview(mapReview(data, profile));

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
      prev
        ? { ...prev, likesCount: prev.likesCount + (wasLiked ? -1 : 1) }
        : prev,
    );

    try {
      if (wasLiked) {
        await supabase
          .from("likes")
          .delete()
          .eq("review_id", review.id)
          .eq("user_id", authUser.id);
      } else {
        await supabase
          .from("likes")
          .insert({ review_id: review.id, user_id: authUser.id });
      }
    } catch {
      // ロールバック
      setLiked(wasLiked);
      setReview((prev) =>
        prev
          ? { ...prev, likesCount: prev.likesCount + (wasLiked ? 1 : -1) }
          : prev,
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
        await supabase
          .from("bookmarks")
          .insert({ review_id: review.id, user_id: authUser.id });
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
