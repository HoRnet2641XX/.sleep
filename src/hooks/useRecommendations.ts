"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { mapRow } from "@/components/features/HomeFeed";
import type { ReviewWithUser } from "@/types";

export function useRecommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    (async () => {
      // ユーザーの sleepDisorderTypes を確認
      const { data: profile } = await supabase
        .from("profiles")
        .select("sleep_disorder_types")
        .eq("id", user.id)
        .maybeSingle();

      const types = (profile?.sleep_disorder_types as string[]) ?? [];
      if (types.length === 0) {
        setLoading(false);
        return;
      }

      // RPC でレコメンド取得
      const { data: recs } = await supabase.rpc("get_recommendations", {
        p_user_id: user.id,
        p_limit: 10,
      });

      if (!recs || recs.length === 0) {
        setLoading(false);
        return;
      }

      const reviewIds = recs.map((r: { review_id: string }) => r.review_id);

      // レビュー詳細取得
      const { data: reviewData } = await supabase
        .from("reviews")
        .select("*, profiles(*)")
        .in("id", reviewIds);

      if (reviewData) {
        // RPC のスコア順を維持
        const mapped = reviewData.map((row) => mapRow(row as Record<string, unknown>));
        const ordered = reviewIds
          .map((id: string) => mapped.find((r) => r.id === id))
          .filter(Boolean) as ReviewWithUser[];
        setRecommendations(ordered);
      }

      setLoading(false);
    })();
  }, [user]);

  return { recommendations, loading };
}
