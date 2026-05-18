"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { mapReviewRows } from "@/lib/mappers";
import type { ReviewWithUser } from "@/types";

export function useRecommendations() {
  const { user } = useAuth();
  const userId = user?.id;
  const [recommendations, setRecommendations] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setRecommendations([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      setLoading(true);

      try {
        // ユーザーの sleepDisorderTypes を確認
        const { data: profile } = await supabase
          .from("profiles")
          .select("sleep_disorder_types")
          .eq("id", userId)
          .maybeSingle();

        const types = (profile?.sleep_disorder_types as string[]) ?? [];
        if (types.length === 0) {
          if (!cancelled) setRecommendations([]);
          return;
        }

        // RPC でレコメンド取得
        const { data: recs } = await supabase.rpc("get_recommendations", {
          p_user_id: userId,
          p_limit: 10,
        });

        if (!recs || recs.length === 0) {
          if (!cancelled) setRecommendations([]);
          return;
        }

        const reviewIds = recs.map((r: { review_id: string }) => r.review_id);

        // レビュー詳細取得
        const { data: reviewData } = await supabase
          .from("reviews")
          .select("*, profiles(*)")
          .in("id", reviewIds);

        if (!reviewData) {
          if (!cancelled) setRecommendations([]);
          return;
        }

        // RPC のスコア順を維持
        const mapped = mapReviewRows(reviewData);
        const ordered = reviewIds
          .map((id: string) => mapped.find((review) => review.id === id))
          .filter(Boolean) as ReviewWithUser[];

        if (!cancelled) setRecommendations(ordered);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { recommendations, loading };
}
