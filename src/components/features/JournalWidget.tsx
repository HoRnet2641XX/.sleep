"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Props = {
  userId: string;
  onOpenDetail: (preselectedRating?: number) => void;
};

const QUALITY_OPTIONS = [
  { value: 1, label: "つらい", emoji: "😵" },
  { value: 2, label: "微妙", emoji: "😔" },
  { value: 3, label: "普通", emoji: "😐" },
  { value: 4, label: "良い", emoji: "😊" },
  { value: 5, label: "最高", emoji: "😴" },
] as const;

/**
 * ホームに表示される睡眠記録ウィジェット。
 * - 今日すでに記録済み → サマリー表示 + ダッシュボードへの導線
 * - 未記録 → 絵文字タップでドロワーを開く（タップ気分が初期値）
 */
export function JournalWidget({ userId, onOpenDetail }: Props) {
  const reduced = useReducedMotion();
  const [todaysRating, setTodaysRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // 今日の記録を取得
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("sleep_journals")
        .select("sleep_quality, created_at")
        .eq("user_id", userId)
        .gte("created_at", todayStart.toISOString())
        .order("created_at", { ascending: false })
        .limit(1);
      if (cancelled) return;
      const row = data?.[0];
      if (row?.sleep_quality) {
        setTodaysRating(row.sleep_quality as number);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="mb-5 h-[140px] animate-pulse rounded-2xl bg-surface-card" />
    );
  }

  const selectedOpt = QUALITY_OPTIONS.find((q) => q.value === todaysRating);

  return (
    <motion.section
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mb-5 overflow-hidden rounded-2xl border border-border/50 bg-surface-card"
      aria-label="今日の睡眠記録"
    >
      <AnimatePresence mode="wait" initial={false}>
        {todaysRating ? (
          /* 記録済み状態 */
          <motion.button
            key="recorded"
            type="button"
            onClick={() => onOpenDetail()}
            initial={reduced ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -8 }}
            className="flex w-full items-center gap-4 p-5 text-left transition-colors hover:bg-surface/30"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border/50 bg-surface-elevated text-3xl">
              {selectedOpt?.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.15em] text-content-muted">今日の記録</p>
              <p className="text-base font-bold text-content">
                {selectedOpt?.label}
              </p>
              <p className="mt-0.5 text-xs text-content-muted">
                タップで詳細・追加記録
              </p>
            </div>
            <svg className="h-4 w-4 shrink-0 text-content-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        ) : (
          /* 未記録 → クイック記録 */
          <motion.div
            key="quick"
            initial={reduced ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -8 }}
            className="p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-content">今日はどうでしたか？</p>
                <p className="mt-0.5 text-xs text-content-muted">
                  気分をタップして睡眠記録へ
                </p>
              </div>
            </div>
            <div className="flex gap-1.5">
              {QUALITY_OPTIONS.map((q) => (
                <motion.button
                  key={q.value}
                  type="button"
                  onClick={() => onOpenDetail(q.value)}
                  whileTap={reduced ? {} : { scale: 0.92 }}
                  whileHover={reduced ? {} : { y: -3, scale: 1.04 }}
                  className="group flex flex-1 flex-col items-center gap-1 rounded-xl border border-border/40 bg-surface-elevated/60 py-3 transition-all hover:border-primary/40 hover:bg-surface-elevated"
                  aria-label={`睡眠の質: ${q.label} を記録`}
                >
                  <span className="text-2xl transition-transform">
                    {q.emoji}
                  </span>
                  <span className="text-[10px] font-medium text-content-secondary group-hover:text-content">
                    {q.label}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
