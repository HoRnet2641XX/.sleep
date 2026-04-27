"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/hooks/useSubscription";

type JournalEntry = {
  id: string;
  sleepQuality: number | null;
  body: string | null;
  sleepHours: number | null;
  wakeCount: number | null;
  easeOfSleep: number | null;
  createdAt: string;
};

type Period = "week" | "month" | "quarter";

const QUALITY_OPTIONS = [
  { value: 1, label: "つらい", emoji: "😵" },
  { value: 2, label: "微妙", emoji: "😔" },
  { value: 3, label: "普通", emoji: "😐" },
  { value: 4, label: "良い", emoji: "😊" },
  { value: 5, label: "最高", emoji: "😴" },
] as const;

const QUALITY_LABELS: Record<number, string> = Object.fromEntries(
  QUALITY_OPTIONS.map((q) => [q.value, q.label]),
);
/** バーチャート / 一覧で使う、強度（=不透明度）だけのモノトーン階調 */
const QUALITY_COLORS: Record<number, string> = {
  1: "bg-primary/25",
  2: "bg-primary/40",
  3: "bg-primary/55",
  4: "bg-primary/75",
  5: "bg-primary",
};

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

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string | null;
  /** ホームから絵文字タップで開いたときに初期選択する睡眠の質 */
  initialRating?: number | null;
};

export function SleepDashboardDrawer({ open, onClose, userId, initialRating }: Props) {
  const reduced = useReducedMotion();
  const drawerRef = useRef<HTMLElement>(null);
  const { isPremium } = useSubscription();

  const [rating, setRating] = useState<number | null>(null);
  const [memo, setMemo] = useState("");
  const [sleepHours, setSleepHours] = useState<string>("");
  const [wakeCount, setWakeCount] = useState<number | null>(null);
  const [easeOfSleep, setEaseOfSleep] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<Period>("week");

  // データ取得（ドロワーが開いている間のみ）
  const fetchEntries = useCallback(async () => {
    if (!userId || !open) return;
    setLoading(true);
    const daysBack = period === "week" ? 7 : period === "month" ? 30 : 90;
    const since = new Date(
      Date.now() - daysBack * 24 * 60 * 60 * 1000,
    ).toISOString();

    const { data } = await supabase
      .from("sleep_journals")
      .select("id, sleep_quality, body, sleep_hours, wake_count, ease_of_sleep, created_at")
      .eq("user_id", userId)
      .gte("created_at", since)
      .order("created_at", { ascending: true });

    setEntries(
      (data ?? []).map((row) => ({
        id: row.id as string,
        sleepQuality: row.sleep_quality as number | null,
        body: row.body as string | null,
        sleepHours: row.sleep_hours as number | null,
        wakeCount: row.wake_count as number | null,
        easeOfSleep: row.ease_of_sleep as number | null,
        createdAt: row.created_at as string,
      })),
    );
    setLoading(false);
  }, [userId, open, period]);

  useEffect(() => {
    if (open) fetchEntries();
  }, [open, fetchEntries]);

  // ホームから絵文字タップで開いたとき、初期値を反映
  useEffect(() => {
    if (open && initialRating != null) {
      setRating(initialRating);
    }
  }, [open, initialRating]);

  // ESC で閉じる + body スクロール抑制
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!userId || rating === null) return;
    setSubmitting(true);
    try {
      const hours = sleepHours.trim() ? parseFloat(sleepHours) : null;
      await supabase.from("sleep_journals").insert({
        user_id: userId,
        body: memo.trim() || null,
        sleep_quality: rating,
        sleep_hours: hours !== null && !isNaN(hours) ? hours : null,
        wake_count: wakeCount,
        ease_of_sleep: easeOfSleep,
        created_at: new Date().toISOString(),
      });
      setSubmitted(true);
      setRating(null);
      setMemo("");
      setSleepHours("");
      setWakeCount(null);
      setEaseOfSleep(null);
      await fetchEntries();
      setTimeout(() => setSubmitted(false), 2000);
    } catch {
      // ignore
    }
    setSubmitting(false);
  }, [userId, rating, memo, sleepHours, wakeCount, easeOfSleep, fetchEntries]);

  const days = period === "week" ? 7 : period === "month" ? 30 : 90;
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

  const maxBarHeight = 80;

  /* プログレッシブ・ハイライト用 */
  const formSteps = [
    rating !== null,
    sleepHours !== "",
    wakeCount !== null,
    easeOfSleep !== null,
  ];
  const firstUnfilled = formSteps.findIndex((d) => !d);
  const stepIndex = firstUnfilled === -1 ? 4 : firstUnfilled;
  const completedCount = formSteps.filter(Boolean).length;
  type SectionState = "active" | "done" | "pending";
  const sectionStateOf = (idx: number): SectionState =>
    formSteps[idx] ? "done" : idx === stepIndex ? "active" : "pending";
  /** 共通: 状態でカードの強弱だけ変える（色分けはしない） */
  const sectionClassOf = (state: SectionState): string => {
    if (state === "active") {
      return "border-primary/40 bg-surface-card shadow-md shadow-black/20";
    }
    if (state === "done") return "border-border/40 bg-surface-card/60";
    return "border-border/20 bg-surface-card/30 opacity-55";
  };
  /** 番号バッジ */
  const badgeClassOf = (state: SectionState): string => {
    if (state === "done") return "bg-primary text-white";
    if (state === "active")
      return "bg-primary/20 text-primary ring-1 ring-primary/40";
    return "bg-surface-elevated text-content-muted";
  };
  /** 見出しテキスト色 */
  const labelClassOf = (state: SectionState): string =>
    state === "pending" ? "text-content-muted" : "text-content-secondary";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* オーバーレイ */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-surface/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ドロワー本体 */}
          <motion.aside
            ref={drawerRef}
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-surface-card"
            role="dialog"
            aria-modal="true"
            aria-label="睡眠ダッシュボード"
          >
            {/* ヘッダー */}
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-content">睡眠ダッシュボード</h2>
                {isPremium && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400/20 to-amber-300/10 px-2 py-0.5 text-[10px] font-bold text-accent ring-1 ring-accent/30">
                    <svg className="h-2.5 w-2.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 3h14v2H5v-2z" />
                    </svg>
                    PREMIUM
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-content-muted hover:bg-surface-elevated hover:text-content"
                aria-label="閉じる"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {!userId ? (
                <p className="py-12 text-center text-sm text-content-muted">
                  ログインが必要です
                </p>
              ) : (
                <>
                  {/* 記録入力 — プログレッシブ・ハイライト */}
                  <section className="mb-6 space-y-3">
                    {/* 進捗バー + 見出し */}
                    <div className="mb-2">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-content">今日の睡眠を記録</h3>
                        <span className="text-xs font-medium text-content-secondary">
                          {completedCount} / 4
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {formSteps.map((done, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              done
                                ? "bg-primary"
                                : i === stepIndex
                                ? "bg-primary/40"
                                : "bg-border/40"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* 1. 睡眠の質 */}
                    <div className={`rounded-xl border p-4 transition-all ${sectionClassOf(sectionStateOf(0))}`}>
                      <p className={`mb-2 flex items-center gap-1.5 text-[11px] font-medium ${labelClassOf(sectionStateOf(0))}`}>
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${badgeClassOf(sectionStateOf(0))}`}>
                          {sectionStateOf(0) === "done" ? "✓" : "1"}
                        </span>
                        睡眠の質 <span className="text-error">*</span>
                      </p>
                      <div className="flex gap-1.5">
                        {QUALITY_OPTIONS.map((q) => (
                          <button
                            key={q.value}
                            type="button"
                            onClick={() => setRating(rating === q.value ? null : q.value)}
                            aria-pressed={rating === q.value}
                            className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-2.5 text-[10px] font-medium transition-all duration-micro ${
                              rating === q.value
                                ? "bg-primary text-white ring-2 ring-primary/40 scale-105 shadow-lg"
                                : "bg-surface-elevated/60 text-content-secondary hover:bg-surface-elevated"
                            }`}
                          >
                            <span className="text-lg">{q.emoji}</span>
                            <span>{q.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 2. 睡眠時間 */}
                    <div className={`rounded-xl border p-4 transition-all ${sectionClassOf(sectionStateOf(1))}`}>
                      <p className={`mb-2 flex items-center gap-1.5 text-[11px] font-medium ${labelClassOf(sectionStateOf(1))}`}>
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${badgeClassOf(sectionStateOf(1))}`}>
                          {sectionStateOf(1) === "done" ? "✓" : "2"}
                        </span>
                        睡眠時間
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {["4", "5", "6", "7", "8", "9"].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setSleepHours(sleepHours === h ? "" : h)}
                            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                              sleepHours === h
                                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                                : "bg-surface-elevated/60 text-content-secondary hover:bg-surface-elevated"
                            }`}
                          >
                            {h}h
                          </button>
                        ))}
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="24"
                          value={["4","5","6","7","8","9"].includes(sleepHours) ? "" : sleepHours}
                          onChange={(e) => setSleepHours(e.target.value)}
                          placeholder="他"
                          className="w-16 rounded-lg border border-border bg-surface-input px-2 py-2 text-center text-xs text-content placeholder:text-content-muted focus:border-primary focus:outline-none"
                          aria-label="睡眠時間（カスタム）"
                        />
                      </div>
                    </div>

                    {/* 3. 夜中の起床回数 */}
                    <div className={`rounded-xl border p-4 transition-all ${sectionClassOf(sectionStateOf(2))}`}>
                      <p className={`mb-2 flex items-center gap-1.5 text-[11px] font-medium ${labelClassOf(sectionStateOf(2))}`}>
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${badgeClassOf(sectionStateOf(2))}`}>
                          {sectionStateOf(2) === "done" ? "✓" : "3"}
                        </span>
                        夜中の起床
                      </p>
                      <div className="flex gap-1.5">
                        {[0, 1, 2, 3].map((n) => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => setWakeCount(wakeCount === n ? null : n)}
                            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                              wakeCount === n
                                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                                : "bg-surface-elevated/60 text-content-secondary hover:bg-surface-elevated"
                            }`}
                          >
                            {n === 0 ? "なし" : `${n}回`}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setWakeCount(wakeCount === 4 ? null : 4)}
                          className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${
                            wakeCount !== null && wakeCount >= 4
                              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                              : "bg-surface-elevated/60 text-content-secondary hover:bg-surface-elevated"
                          }`}
                        >
                          4回+
                        </button>
                      </div>
                    </div>

                    {/* 4. 寝つき */}
                    <div className={`rounded-xl border p-4 transition-all ${sectionClassOf(sectionStateOf(3))}`}>
                      <p className={`mb-2 flex items-center gap-1.5 text-[11px] font-medium ${labelClassOf(sectionStateOf(3))}`}>
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${badgeClassOf(sectionStateOf(3))}`}>
                          {sectionStateOf(3) === "done" ? "✓" : "4"}
                        </span>
                        寝つきの良さ
                      </p>
                      <div className="flex gap-1.5">
                        {[
                          { v: 1, label: "とても悪い" },
                          { v: 2, label: "悪い" },
                          { v: 3, label: "普通" },
                          { v: 4, label: "良い" },
                          { v: 5, label: "すぐ眠れた" },
                        ].map((e) => (
                          <button
                            key={e.v}
                            type="button"
                            onClick={() => setEaseOfSleep(easeOfSleep === e.v ? null : e.v)}
                            className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2.5 text-[10px] font-medium transition-colors ${
                              easeOfSleep === e.v
                                ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                                : "bg-surface-elevated/60 text-content-secondary hover:bg-surface-elevated"
                            }`}
                          >
                            <span className="flex gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <span
                                  key={i}
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    i <= e.v
                                      ? easeOfSleep === e.v
                                        ? "bg-primary"
                                        : "bg-content-muted/50"
                                      : "bg-border/30"
                                  }`}
                                />
                              ))}
                            </span>
                            <span className="truncate text-[9px]">{e.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 5. メモ + 送信 — 必須項目が完了したらハイライト */}
                    <div className={`rounded-xl border p-4 transition-all ${
                      stepIndex >= 4
                        ? "border-primary/40 bg-surface-card shadow-md shadow-black/20"
                        : rating !== null
                        ? "border-border/40 bg-surface-card/60"
                        : "border-border/20 bg-surface-card/30 opacity-55"
                    }`}>
                      <p className={`mb-2 flex items-center gap-1.5 text-[11px] font-medium ${
                        stepIndex >= 4 ? "text-content-secondary" : "text-content-muted"
                      }`}>
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                          stepIndex >= 4
                            ? "bg-primary/20 text-primary ring-1 ring-primary/40"
                            : "bg-surface-elevated text-content-muted"
                        }`}>
                          5
                        </span>
                        メモ + 記録
                      </p>
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
                          placeholder="一言メモ（任意）"
                          className="min-w-0 flex-1 rounded-lg border border-border bg-surface-input px-3 py-2 text-sm text-content placeholder:text-content-muted focus:border-primary focus:outline-none"
                          maxLength={200}
                        />
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={rating === null || submitting}
                          className="shrink-0 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white shadow-md shadow-black/20 transition-all hover:bg-primary-hover hover:shadow-lg disabled:opacity-40 disabled:shadow-none"
                        >
                          {submitted ? "✓ 記録済" : submitting ? "..." : "記録する"}
                        </button>
                      </div>
                      <p className="mt-2 text-[10px] text-content-muted">
                        睡眠の質のみ必須。他は任意でタップ選択。
                      </p>
                    </div>
                  </section>

                  {/* サマリー */}
                  <div className="mb-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border/50 bg-surface-card px-4 py-3">
                      <p className="text-xs text-content-muted">平均スコア</p>
                      <p className="mt-1 text-xl font-bold text-content">
                        {avgScore !== null ? avgScore : "—"}
                      </p>
                      <p className="mt-0.5 text-xs text-content-secondary">
                        {avgScore !== null ? QUALITY_LABELS[Math.round(avgScore)] ?? "" : "記録なし"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-surface-card px-4 py-3">
                      <p className="text-xs text-content-muted">記録率</p>
                      <p className="mt-1 text-xl font-bold text-content">{recordRate}%</p>
                      <p className="mt-0.5 text-xs text-content-secondary">{days}日中</p>
                    </div>
                  </div>

                  {/* 期間切替 */}
                  <div className="mb-2">
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.15em] text-content-muted">
                      表示期間
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPeriod("week")}
                        className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors duration-micro ${
                          period === "week"
                            ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                            : "bg-surface-elevated text-content-muted hover:bg-surface-card"
                        }`}
                      >
                        1週間
                      </button>
                      <button
                        type="button"
                        onClick={() => setPeriod("month")}
                        className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors duration-micro ${
                          period === "month"
                            ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                            : "bg-surface-elevated text-content-muted hover:bg-surface-card"
                        }`}
                      >
                        1ヶ月
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (isPremium) setPeriod("quarter");
                        }}
                        disabled={!isPremium}
                        className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors duration-micro ${
                          !isPremium
                            ? "border border-dashed border-accent/40 bg-accent/5 text-accent/80 cursor-not-allowed"
                            : period === "quarter"
                            ? "bg-gradient-to-r from-amber-400/20 to-amber-300/10 text-accent ring-1 ring-accent/40"
                            : "bg-surface-elevated text-content-muted hover:bg-surface-card"
                        }`}
                        title={!isPremium ? "プレミアム限定機能" : undefined}
                      >
                        {!isPremium ? (
                          <>
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 3h14v2H5v-2z" />
                            </svg>
                            90日
                          </>
                        ) : (
                          <>90日</>
                        )}
                      </button>
                    </div>
                  </div>

                  {!isPremium && (
                    <div className="mb-5 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-amber-400/10 via-surface-card to-amber-300/5">
                      <div className="flex items-center gap-3 px-4 py-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-white shadow-md">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 3h14v2H5v-2z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-accent">90日トレンドで見えること</p>
                          <p className="text-[11px] text-content-muted">
                            短期では気づけない、あなたの睡眠の本当のパターン
                          </p>
                        </div>
                      </div>
                      <ul className="space-y-2 border-t border-accent/10 bg-surface/40 px-4 py-3 text-xs text-content-secondary">
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span><b className="text-content">月をまたいだ比較</b>で季節性や生活リズムの変化が見える</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span><b className="text-content">試した習慣・サプリの効果</b>を長期で検証できる</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span><b className="text-content">体感と記録のズレ</b>に気づき、思い込みを修正できる</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span><b className="text-content">医師や家族への共有</b>に十分なデータ量が揃う</span>
                        </li>
                      </ul>
                      <Link
                        href="/premium"
                        onClick={onClose}
                        className="flex items-center justify-between border-t border-accent/10 px-4 py-3 text-xs font-bold text-accent transition-colors hover:bg-accent/5"
                      >
                        プレミアムにアップグレード (¥580/月)
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                          <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </Link>
                    </div>
                  )}


                  {/* チャート */}
                  <div className="mb-5 rounded-xl border border-border/50 bg-surface-card p-4">
                    <h3 className="mb-3 text-xs font-semibold text-content">スコアの推移</h3>
                    {loading ? (
                      <div className="flex h-[100px] items-center justify-center">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      </div>
                    ) : (
                      <div className="flex items-end gap-1" style={{ height: `${maxBarHeight + 20}px` }}>
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
                                  ? `${d.date}: ${d.avg}`
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
                                <span className="mt-1 text-[9px] text-content-muted">
                                  {dayLabel}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* 最近の記録 */}
                  <div>
                    <h3 className="mb-3 text-xs font-semibold text-content">最近の記録</h3>
                    {entries.length === 0 && !loading ? (
                      <div className="rounded-xl border border-border/40 bg-surface-card/50 px-4 py-6 text-center">
                        <p className="mb-1 text-sm font-medium text-content">
                          まだ記録がありません
                        </p>
                        <p className="text-xs text-content-secondary">
                          上のフォームから記録してみましょう
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {[...entries].reverse().slice(0, 10).map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-start gap-3 rounded-lg border border-border/40 bg-surface-card/80 px-3 py-2.5"
                          >
                            {entry.sleepQuality !== null && (
                              <span
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold text-white ${QUALITY_COLORS[entry.sleepQuality]}`}
                              >
                                {entry.sleepQuality}
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="mb-0.5 text-xs text-content-muted">
                                {new Date(entry.createdAt).toLocaleDateString("ja-JP", {
                                  month: "short",
                                  day: "numeric",
                                  weekday: "short",
                                })}
                              </p>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-content-secondary">
                                {entry.sleepHours !== null && (
                                  <span className="inline-flex items-center gap-0.5">
                                    <svg className="h-3 w-3 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                      <circle cx="12" cy="12" r="10" />
                                      <path d="M12 6v6l4 2" strokeLinecap="round" />
                                    </svg>
                                    {entry.sleepHours}h
                                  </span>
                                )}
                                {entry.wakeCount !== null && (
                                  <span className="inline-flex items-center gap-0.5">
                                    <svg className="h-3 w-3 text-warning/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                      <path d="M12 2v4M5 5l3 3M2 12h4M19 5l-3 3M22 12h-4M12 22a10 10 0 01-10-10" strokeLinecap="round" />
                                    </svg>
                                    起床{entry.wakeCount}回
                                  </span>
                                )}
                                {entry.easeOfSleep !== null && (
                                  <span className="inline-flex items-center gap-0.5">
                                    寝つき
                                    <span className="flex gap-0.5">
                                      {[1, 2, 3, 4, 5].map((i) => (
                                        <span
                                          key={i}
                                          className={`h-1.5 w-1.5 rounded-full ${
                                            i <= (entry.easeOfSleep ?? 0)
                                              ? "bg-accent"
                                              : "bg-border"
                                          }`}
                                        />
                                      ))}
                                    </span>
                                  </span>
                                )}
                              </div>
                              {entry.body && (
                                <p className="mt-1 truncate text-sm text-content">{entry.body}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
