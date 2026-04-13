"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

type JournalEntry = {
  id: string;
  sleepQuality: number | null;
  body: string | null;
  createdAt: string;
};

type Period = "week" | "month";

const QUALITY_LABELS: Record<number, string> = {
  1: "つらい",
  2: "微妙",
  3: "普通",
  4: "良い",
  5: "最高",
};

const QUALITY_COLORS: Record<number, string> = {
  1: "bg-error/60",
  2: "bg-warning/40",
  3: "bg-content-muted/40",
  4: "bg-primary/50",
  5: "bg-accent/60",
};

/** 日付を YYYY-MM-DD に */
function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** 直近N日の日付配列を生成 */
function getDateRange(days: number): string[] {
  const result: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    result.push(toDateKey(d));
  }
  return result;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const reduced = useReducedMotion();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("week");
  const [reviewCount, setReviewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);

  // ジャーナルデータ取得
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const since = new Date(
        Date.now() - (period === "week" ? 7 : 30) * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data } = await supabase
        .from("sleep_journals")
        .select("id, sleep_quality, body, created_at")
        .eq("user_id", user.id)
        .gte("created_at", since)
        .order("created_at", { ascending: true });

      setEntries(
        (data ?? []).map((row) => ({
          id: row.id as string,
          sleepQuality: row.sleep_quality as number | null,
          body: row.body as string | null,
          createdAt: row.created_at as string,
        })),
      );
      setLoading(false);
    })();
  }, [user, period]);

  // ユーザーの統計
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [reviews, likes] = await Promise.all([
        supabase
          .from("reviews")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
        supabase
          .from("likes")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);
      setReviewCount(reviews.count ?? 0);
      setLikeCount(likes.count ?? 0);
    })();
  }, [user]);

  // チャートデータ
  const days = period === "week" ? 7 : 30;
  const dateRange = useMemo(() => getDateRange(days), [days]);
  const chartData = useMemo(() => {
    const byDate: Record<string, number[]> = {};
    for (const entry of entries) {
      if (entry.sleepQuality === null) continue;
      const key = toDateKey(new Date(entry.createdAt));
      if (!byDate[key]) byDate[key] = [];
      byDate[key].push(entry.sleepQuality);
    }
    return dateRange.map((date) => {
      const vals = byDate[date];
      if (!vals || vals.length === 0) return { date, avg: null };
      return {
        date,
        avg: Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
      };
    });
  }, [entries, dateRange]);

  // 平均スコア
  const avgScore = useMemo(() => {
    const valid = chartData.filter((d) => d.avg !== null);
    if (valid.length === 0) return null;
    const sum = valid.reduce((a, b) => a + (b.avg ?? 0), 0);
    return Math.round((sum / valid.length) * 10) / 10;
  }, [chartData]);

  // 記録率
  const recordRate = useMemo(() => {
    const recorded = chartData.filter((d) => d.avg !== null).length;
    return Math.round((recorded / chartData.length) * 100);
  }, [chartData]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-content-secondary">ログインが必要です</p>
        <Link href="/login" className="btn-primary">ログイン</Link>
      </div>
    );
  }

  const maxBarHeight = 80; // px

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-content items-center gap-3 px-4 py-3">
          <Link
            href="/"
            className="flex items-center text-content-secondary hover:text-content"
            aria-label="ホームに戻る"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-content">睡眠ダッシュボード</h1>
        </div>
      </header>

      <main className="mx-auto max-w-content px-4 pb-24 pt-5">
        {/* サマリーカード */}
        <div className="mb-5 grid grid-cols-3 gap-3">
          {[
            {
              label: "平均スコア",
              value: avgScore !== null ? `${avgScore}` : "—",
              sub: avgScore !== null ? QUALITY_LABELS[Math.round(avgScore)] ?? "" : "記録なし",
            },
            { label: "記録率", value: `${recordRate}%`, sub: `${days}日中` },
            {
              label: "投稿数",
              value: `${reviewCount}`,
              sub: `${likeCount}いいね`,
            },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={reduced ? {} : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border/50 bg-surface-card px-3 py-4 text-center"
            >
              <p className="mb-1 text-2xl font-bold text-content">
                {stat.value}
              </p>
              <p className="text-xs text-content-muted">{stat.label}</p>
              <p className="mt-0.5 text-xs text-content-secondary">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* 期間切り替え */}
        <div className="mb-4 flex gap-2">
          {([
            { key: "week" as Period, label: "1週間" },
            { key: "month" as Period, label: "1ヶ月" },
          ]).map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriod(p.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-micro ${
                period === p.key
                  ? "bg-primary/15 text-primary"
                  : "text-content-muted hover:bg-surface-elevated"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* バーチャート */}
        <motion.div
          initial={reduced ? {} : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6 rounded-xl border border-border/50 bg-surface-card p-4"
        >
          <h2 className="mb-4 text-sm font-semibold text-content">
            睡眠スコアの推移
          </h2>
          {loading ? (
            <div className="flex h-[120px] items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="flex items-end gap-1" style={{ height: `${maxBarHeight + 24}px` }}>
              {chartData.map((d, i) => {
                const barH = d.avg !== null ? (d.avg / 5) * maxBarHeight : 0;
                const colorClass = d.avg !== null
                  ? QUALITY_COLORS[Math.round(d.avg)] ?? "bg-content-muted/30"
                  : "bg-border/30";
                const dayLabel = new Date(d.date).getDate().toString();
                const showLabel =
                  period === "week" ||
                  i === 0 ||
                  i === chartData.length - 1 ||
                  (i + 1) % 5 === 0;

                return (
                  <div
                    key={d.date}
                    className="flex flex-1 flex-col items-center"
                    title={
                      d.avg !== null
                        ? `${d.date}: ${d.avg} (${QUALITY_LABELS[Math.round(d.avg)] ?? ""})`
                        : `${d.date}: 記録なし`
                    }
                  >
                    <motion.div
                      initial={reduced ? {} : { height: 0 }}
                      animate={{ height: d.avg !== null ? barH : 4 }}
                      transition={{ delay: i * 0.02, duration: 0.4 }}
                      className={`w-full min-w-[4px] rounded-t ${colorClass}`}
                    />
                    {showLabel && (
                      <span className="mt-1 text-[10px] text-content-muted">
                        {dayLabel}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 凡例 */}
          <div className="mt-4 flex flex-wrap gap-3">
            {[1, 2, 3, 4, 5].map((v) => (
              <div key={v} className="flex items-center gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-full ${QUALITY_COLORS[v]}`} />
                <span className="text-[10px] text-content-muted">
                  {QUALITY_LABELS[v]}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 最近のジャーナル */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-content">
            最近の記録
          </h2>
          {entries.length === 0 ? (
            <div className="rounded-xl border border-border/40 bg-surface-card/50 px-6 py-8 text-center">
              <img
                src="/mascot.svg"
                alt=""
                className="mx-auto mb-3 h-12 w-12 opacity-50"
                aria-hidden="true"
              />
              <p className="mb-2 text-sm font-medium text-content">
                まだ記録がありません
              </p>
              <p className="text-xs text-content-secondary">
                ホーム画面の「今夜の調子は？」から記録を始めましょう
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...entries].reverse().slice(0, 10).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 rounded-lg border border-border/40 bg-surface-card/80 px-4 py-3"
                >
                  {entry.sleepQuality !== null && (
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${QUALITY_COLORS[entry.sleepQuality]}`}
                    >
                      {entry.sleepQuality}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    {entry.body && (
                      <p className="truncate text-sm text-content">
                        {entry.body}
                      </p>
                    )}
                    <p className="text-xs text-content-muted">
                      {new Date(entry.createdAt).toLocaleDateString("ja-JP", {
                        month: "short",
                        day: "numeric",
                        weekday: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
