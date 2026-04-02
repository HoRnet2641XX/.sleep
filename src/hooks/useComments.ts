"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { CommentWithUser, SleepDisorderType } from "@/types";

/** DB行 → フロント型への変換 */
function mapComment(row: Record<string, unknown>, profile: Record<string, unknown>): CommentWithUser {
  return {
    id: row.id as string,
    reviewId: row.review_id as string,
    userId: row.user_id as string,
    body: row.body as string,
    createdAt: row.created_at as string,
    user: {
      id: profile.id as string,
      nickname: profile.nickname as string,
      avatarUrl: (profile.avatar_url as string) ?? null,
      height: (profile.height as number) ?? null,
      weight: (profile.weight as number) ?? null,
      gender: (profile.gender as CommentWithUser["user"]["gender"]) ?? null,
      ageGroup: (profile.age_group as string) ?? null,
      sleepDisorderTypes: (profile.sleep_disorder_types as SleepDisorderType[]) ?? [],
      cause: (profile.cause as string) ?? null,
      createdAt: profile.created_at as string,
      updatedAt: profile.updated_at as string,
    },
  };
}

/** コメント一覧取得フック */
export function useComments(reviewId: string) {
  const { user: authUser } = useAuth();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /** コメント一覧取得 */
  const fetchComments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("comments")
        .select("*, profiles(*)")
        .eq("review_id", reviewId)
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;

      const mapped = (data ?? []).map((row) => {
        const profile = row.profiles as Record<string, unknown>;
        return mapComment(row, profile);
      });

      setComments(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : "コメントの取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Supabase Realtime でコメント追加/削除を監視
  useEffect(() => {
    const channel = supabase
      .channel(`comments:${reviewId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "comments",
          filter: `review_id=eq.${reviewId}`,
        },
        () => {
          // 変更があったら再取得
          fetchComments();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reviewId, fetchComments]);

  /** コメント追加 */
  const addComment = useCallback(
    async (body: string): Promise<boolean> => {
      if (!authUser) return false;

      setSubmitting(true);
      try {
        const { error: insertError } = await supabase.from("comments").insert({
          review_id: reviewId,
          user_id: authUser.id,
          body,
        });

        if (insertError) throw insertError;

        // Realtime が拾うが、即時反映のために手動で再取得
        await fetchComments();
        return true;
      } catch {
        setError("コメントの投稿に失敗しました");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [authUser, reviewId, fetchComments],
  );

  return {
    comments,
    loading,
    error,
    submitting,
    addComment,
    refetch: fetchComments,
  };
}
