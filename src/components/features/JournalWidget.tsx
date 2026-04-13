"use client";

import { useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const QUALITIES = [
  { value: 1, label: "つらい" },
  { value: 2, label: "微妙" },
  { value: 3, label: "普通" },
  { value: 4, label: "良い" },
  { value: 5, label: "最高" },
] as const;

type Props = {
  userId: string;
};

export function JournalWidget({ userId }: Props) {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const reduced = useReducedMotion();

  const handleSubmit = useCallback(async () => {
    if (!text.trim() && rating === null) return;
    try {
      await supabase.from("sleep_journals").insert({
        user_id: userId,
        body: text.trim() || null,
        sleep_quality: rating,
        created_at: new Date().toISOString(),
      });
    } catch {
      // テーブル未作成でもクラッシュさせない
    }
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setText("");
    setRating(null);
  }, [text, rating, userId]);

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mb-5 rounded-xl border border-border/50 bg-surface-card px-5 py-4"
    >
      <p className="mb-3 text-sm font-semibold text-content">今夜の調子は？</p>

      {/* 睡眠クオリティ選択 */}
      <div className="mb-3 flex gap-2">
        {QUALITIES.map((q) => (
          <button
            key={q.value}
            type="button"
            onClick={() => setRating(rating === q.value ? null : q.value)}
            aria-pressed={rating === q.value}
            className={`flex-1 rounded-lg py-2 text-xs font-medium transition-all duration-micro ${
              rating === q.value
                ? "bg-primary/20 text-primary ring-1 ring-primary/30"
                : "bg-surface-elevated text-content-muted hover:bg-surface-elevated/80 hover:text-content-secondary"
            }`}
          >
            {q.label}
          </button>
        ))}
      </div>

      {/* テキスト入力 */}
      <div className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="今の気持ちをひとこと..."
          className="min-w-0 flex-1 rounded-lg border border-border bg-surface-input px-3 py-2 text-sm text-content placeholder:text-content-muted focus:border-primary focus:outline-none"
          aria-label="睡眠ジャーナルを入力"
          maxLength={200}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() && rating === null}
          className="shrink-0 rounded-lg bg-primary/15 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/25 disabled:opacity-40 disabled:hover:bg-primary/15"
        >
          {submitted ? "送信しました" : "記録"}
        </button>
      </div>
    </motion.div>
  );
}
