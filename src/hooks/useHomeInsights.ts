"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABELS } from "@/types";
import type { ReviewCategory } from "@/types";
import type { InsightData } from "@/components/features/SleepInsightCard";

/**
 * ホーム画面用のコミュニティデータ取得:
 * - ニックネーム
 * - 24h アクティブユーザー数
 * - 週間カテゴリトレンド（インサイト）
 */
export function useHomeInsights(userId: string | undefined) {
  const [nickname, setNickname] = useState<string | undefined>();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<number | null>(null);
  const [insight, setInsight] = useState<InsightData | null>(null);

  useEffect(() => {
    if (!userId) return;

    // ニックネーム・アバター取得
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("nickname, avatar_url")
        .eq("id", userId)
        .maybeSingle();
      if (data?.nickname) setNickname(data.nickname as string);
      if (data?.avatar_url !== undefined) setAvatarUrl((data?.avatar_url as string) ?? null);
    })();

    // 24h 以内のアクティブユーザー数
    (async () => {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [reviewUsers, likeUsers] = await Promise.all([
        supabase.from("reviews").select("user_id").gte("created_at", since),
        supabase.from("likes").select("user_id").gte("created_at", since),
      ]);
      const uniqueIds = new Set<string>();
      (reviewUsers.data ?? []).forEach((r) =>
        uniqueIds.add(r.user_id as string),
      );
      (likeUsers.data ?? []).forEach((r) =>
        uniqueIds.add(r.user_id as string),
      );
      uniqueIds.add(userId);
      setActiveUsers(uniqueIds.size);
    })();

    // 週間カテゴリトレンド
    (async () => {
      const since = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000,
      ).toISOString();
      const { data: recentReviews } = await supabase
        .from("reviews")
        .select("category")
        .gte("created_at", since);
      if (!recentReviews || recentReviews.length === 0) return;

      const counts: Record<string, number> = {};
      recentReviews.forEach((r) => {
        const cat = r.category as string;
        counts[cat] = (counts[cat] || 0) + 1;
      });

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      if (sorted.length === 0) return;
      const [topCat, topCount] = sorted[0];
      const catLabel =
        CATEGORY_LABELS[topCat as ReviewCategory] ?? topCat;

      setInsight({
        type: "trend",
        title: `今週は「${catLabel}」が話題`,
        description: `この1週間で${topCount}件のレビューが投稿されました。みんなが試しているアイテムをチェックしてみましょう。`,
        icon: null, // アイコンは表示側で注入
      });
    })();
  }, [userId]);

  return { nickname, avatarUrl, activeUsers, insight };
}
