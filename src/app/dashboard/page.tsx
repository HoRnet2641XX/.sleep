"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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

const QUALITY_OPTIONS = [
  { value: 1, label: "つらい", emoji: "😵", color: "bg-error/60", ring: "ring-error/30" },
  { value: 2, label: "微妙", emoji: "😔", color: "bg-warning/40", ring: "ring-warning/30" },
  { value: 3, label: "普通", emoji: "😐", color: "bg-content-muted/40", ring: "ring-content-muted/30" },
  { value: 4, label: "良い", emoji: "😊", color: "bg-primary/50", ring: "ring-primary/30" },
  { value: 5, label: "最高", emoji: "😴", color: "bg-accent/60", ring: "ring-accent/30" },
] as const;

const QUALITY_LABELS: Record<number, string> = Object.fromEntries(
  QUALITY_OPTIONS.map((q) => [q.value, q.label]),
);
const QUALITY_COLORS: Record<number, string> = Object.fromEntries(
  QUALITY_OPTIONS.map((q) => [q.value, q.color]),
);

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

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

  // --- 記録入力 ---
  const [rating, setRating] = useState<number | null>(null);
  const [memo, setMemo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // --- データ ---
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("week");

  // データ取得
  const fetchEntries = useCallback(async () => {
    if (!user) return;
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
  }, [user, period]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // 記録送信
  const handleSubmit = useCallback(async () => {
    if (!user || rating === null) return;
    setSubmitting(true);
    try {
      await supabase.from("sleep_journals").insert({
        user_id: user.id,
        body: memo.trim() || null,
        sleep_quality: rating,
        created_at: new Date().toISOString(),
      });
      setSubmitted(true);
      setRating(null);
      setMemo("");
      // 送信後にデータを再取得して即反映
      await fetchEntries();
      setTimeout(() => setSubmitted(false), 2000);
    } catch {
      // テーブル未作成等
    }
    setSubmitting(false);
  }, [user, rating, memo, fetchEntries]);

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

  const avgScore = useMemo(() => {
    const valid = chartData.filter((d) => d.avg !== null);
    if (valid.length === 0) return null;
    const sum = valid.reduce((a, b) => a + (b.avg ?? 0), 0);
    return Math.round((sum / valid.length) * 10) / 10;
  }, [chartData]);

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

  const maxBarHeight = 80;

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
        {/* ─── 記録入力エリア ─── */}
        <motion.section
          initial={reduced ? {} : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 rounded-2xl border border-primary/15 bg-gradient-to-b from-primary/5 to-transparent p-5"
        >
          <h2 className="mb-4 text-base font-bold text-content">今日の睡眠を記録</h2>

          {/* スコア選択 */}
          <div className="mb-4 flex gap-2">
            {QUALITY_OPTIONS.map((q) => (
              <button
                key={q.value}
                type="button"
                onClick={() => setRating(rating === q.value ? null : q.value)}
                aria-pressed={rating === q.value}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-3 text-xs font-medium transition-all duration-micro ${
                  rating === q.value
                    ? `${q.color} text-white ring-2 ${q.ring} scale-105`
                    : "bg-surface-card text-content-muted hover:bg-surface-elevated"
                }`}
              >
                <span className="text-lg">{q.emoji}</span>
                <span>{q.label}</span>
              </button>
            ))}
          </div>

          {/* メモ + 送信 */}
          <div className="flex gap-2">
            <input
              type="text"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder="メモ（任意）"
              className="min-w-0 flex-1 rounded-xl border border-border bg-surface-input px-4 py-2.5 text-sm text-content placeholder:text-content-muted focus:border-primary focus:outline-none"
              maxLength={200}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={rating === null || submitting}
              className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-primary-hover disabled:opacity-40"
            >
              {submitted ? "記録しました" : submitting ? "送信中..." : "記録する"}
            </button>
          </div>
        </motion.section>

        {/* ─── サマリー ─── */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border/50 bg-surface-card px-4 py-4">
            <p className="text-xs text-content-muted">平均スコア</p>
            <p className="mt-1 text-2xl font-bold text-content">
              {avgScore !== null ? avgScore : "—"}
            </p>
            <p className="mt-0.5 text-xs text-content-secondary">
              {avgScore !== null ? QUALITY_LABELS[Math.round(avgScore)] ?? "" : "記録なし"}
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-surface-card px-4 py-4">
            <p className="text-xs text-content-muted">記録率</p>
            <p className="mt-1 text-2xl font-bold text-content">{recordRate}%</p>
            <p className="mt-0.5 text-xs text-content-secondary">{days}日中</p>
          </div>
        </div>

        {/* ─── 期間切り替え + チャート ─── */}
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
            {QUALITY_OPTIONS.map((q) => (
              <div key={q.value} className="flex items-center gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-full ${q.color}`} />
                <span className="text-[10px] text-content-muted">{q.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ─── 最近の記録 ─── */}
        <div>
          <h2 className="mb-3 text-sm font-semibold text-content">最近の記録</h2>
          {entries.length === 0 && !loading ? (
            <div className="rounded-xl border border-border/40 bg-surface-card/50 px-6 py-8 text-center">
              <p className="mb-2 text-sm font-medium text-content">
                まだ記録がありません
              </p>
              <p className="text-xs text-content-secondary">
                上のフォームから今日の睡眠を記録してみましょう
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
                      <p className="truncate text-sm text-content">{entry.body}</p>
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
