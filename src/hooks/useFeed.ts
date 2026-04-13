"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { mapReviewRow } from "@/lib/mapReview";
import type { ReviewCategory, ReviewWithUser } from "@/types";

export type SortKey = "new" | "popular" | "following";

export function useFeed(
  category: ReviewCategory | "all",
  sortBy: SortKey,
  userId: string | undefined,
  isSearching: boolean,
) {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    setLoading(true);

    if (sortBy === "following" && userId) {
      const { data: followData } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);
      const ids = (followData ?? []).map((f) => f.following_id as string);
      if (ids.length === 0) {
        setReviews([]);
        setLoading(false);
        return;
      }
      let query = supabase
        .from("reviews")
        .select("*, profiles(*)")
        .in("user_id", ids)
        .order("created_at", { ascending: false })
        .limit(50);
      if (category !== "all") {
        query = query.eq("category", category);
      }
      const { data } = await query;
      setReviews(
        (data ?? []).map((row) =>
          mapReviewRow(row as Record<string, unknown>),
        ),
      );
      setLoading(false);
      return;
    }

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
    setReviews(
      (data ?? []).map((row) =>
        mapReviewRow(row as Record<string, unknown>),
      ),
    );
    setLoading(false);
  }, [category, sortBy, userId]);

  useEffect(() => {
    if (!isSearching) {
      fetchReviews();
    }
  }, [fetchReviews, isSearching]);

  return { reviews, setReviews, loading };
}
