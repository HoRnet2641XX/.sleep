"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { mapProfileRow, mapReviewBaseRow } from "@/lib/mappers";
import { useAuth } from "@/hooks/useAuth";
import type { UserProfile, Review, Gender, SleepDisorderType } from "@/types";

/** プロフィール更新用データ型 */
export interface ProfileUpdateData {
  nickname: string;
  height: number | null;
  weight: number | null;
  gender: Gender | null;
  ageGroup: string | null;
  sleepDisorderTypes: SleepDisorderType[];
  cause: string | null;
}

/** プロフィール取得・管理フック */
export function useProfile(userId: string) {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalLikes, setTotalLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwnProfile = authUser?.id === userId;

  /** プロフィール + レビュー一覧取得 */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // プロフィールとレビューを並行取得
      const [profileRes, reviewsRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).single(),
        supabase
          .from("reviews")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (!profileRes.data) throw new Error("プロフィールが見つかりません");

      const mappedProfile = mapProfileRow(profileRes.data);
      const mappedReviews = (reviewsRes.data ?? []).map((r) =>
        mapReviewBaseRow(r as Record<string, unknown>),
      );

      // いいね総数を計算
      const likes = mappedReviews.reduce((sum, r) => sum + r.likesCount, 0);

      setProfile(mappedProfile);
      setReviews(mappedReviews);
      setTotalLikes(likes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /** プロフィール更新（本人のみ） */
  const updateProfile = useCallback(
    async (data: ProfileUpdateData): Promise<boolean> => {
      if (!isOwnProfile || !authUser) return false;

      try {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            nickname: data.nickname,
            height: data.height,
            weight: data.weight,
            gender: data.gender,
            age_group: data.ageGroup,
            sleep_disorder_types: data.sleepDisorderTypes,
            cause: data.cause,
            updated_at: new Date().toISOString(),
          })
          .eq("id", authUser.id);

        if (updateError) throw updateError;

        // ローカル状態を更新
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                ...data,
                updatedAt: new Date().toISOString(),
              }
            : prev,
        );

        return true;
      } catch {
        setError("プロフィールの更新に失敗しました");
        return false;
      }
    },
    [isOwnProfile, authUser],
  );

  return {
    profile,
    reviews,
    totalLikes,
    isOwnProfile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}
