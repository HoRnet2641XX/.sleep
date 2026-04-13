"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { mapReviewRow } from "@/lib/mapReview";
import type { ReviewWithUser, SleepDisorderType } from "@/types";
import { SLEEP_DISORDER_LABELS } from "@/types";

export type MatchNotification = {
  review: ReviewWithUser;
  matchedTypes: SleepDisorderType[];
  label: string;
};

/**
 * 同じ sleep_disorder_types を持つユーザーの新着レビューを取得。
 * 直近48時間以内、自分以外の投稿に限定。
 */
export function useMatchNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<MatchNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    (async () => {
      // 1. 自分の sleep_disorder_types を取得
      const { data: profile } = await supabase
        .from("profiles")
        .select("sleep_disorder_types")
        .eq("id", userId)
        .maybeSingle();

      const myTypes = (profile?.sleep_disorder_types as SleepDisorderType[]) ?? [];
      if (myTypes.length === 0) {
        setLoading(false);
        return;
      }

      // 2. 同じ症状タイプを持つユーザーの48h以内のレビューを取得
      const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
      const { data: reviews } = await supabase
        .from("reviews")
        .select("*, profiles(*)")
        .gte("created_at", since)
        .neq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!reviews || reviews.length === 0) {
        setLoading(false);
        return;
      }

      // 3. 投稿者の症状タイプと自分の症状タイプの交差をチェック
      const matched: MatchNotification[] = [];
      for (const row of reviews) {
        const reviewData = mapReviewRow(row as Record<string, unknown>);
        const authorTypes = reviewData.user.sleepDisorderTypes;
        const overlap = myTypes.filter((t) => authorTypes.includes(t));
        if (overlap.length > 0) {
          matched.push({
            review: reviewData,
            matchedTypes: overlap,
            label: overlap.map((t) => SLEEP_DISORDER_LABELS[t]).join("・"),
          });
        }
      }

      setNotifications(matched.slice(0, 5));
      setLoading(false);
    })();
  }, [userId]);

  return { notifications, loading };
}
