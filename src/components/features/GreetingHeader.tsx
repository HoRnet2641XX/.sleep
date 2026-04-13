"use client";

import { motion, useReducedMotion } from "framer-motion";

/* ─── 時間帯の判定 ─── */
export type TimeSlot =
  | "late_night"
  | "deep_night"
  | "dawn"
  | "morning"
  | "daytime";

export function getTimeSlot(hour: number): TimeSlot {
  if (hour >= 22 || hour < 1) return "late_night";
  if (hour >= 1 && hour < 4) return "deep_night";
  if (hour >= 4 && hour < 6) return "dawn";
  if (hour >= 6 && hour < 11) return "morning";
  return "daytime";
}

const TIME_GREETINGS: Record<TimeSlot, { message: string; sub: string }> = {
  late_night: {
    message: "眠れない夜、ここにいます",
    sub: "同じ時間を過ごす仲間がいます",
  },
  deep_night: {
    message: "深夜の静かな時間",
    sub: "焦らなくて大丈夫。ゆっくりいきましょう",
  },
  dawn: {
    message: "もうすぐ朝が来ます",
    sub: "今夜もお疲れさまでした",
  },
  morning: {
    message: "おはようございます",
    sub: "昨夜はどうでしたか？",
  },
  daytime: {
    message: "今夜のために",
    sub: "ゆっくり準備しましょう",
  },
};

/** 時間帯に応じたアンビエントグラデーション */
export function getAmbientGradient(slot: TimeSlot): string {
  switch (slot) {
    case "late_night":
      return "radial-gradient(ellipse at 30% 0%, rgba(139,108,192,0.07) 0%, transparent 60%), radial-gradient(ellipse at 70% 10%, rgba(169,143,216,0.04) 0%, transparent 50%)";
    case "deep_night":
      return "radial-gradient(ellipse at 40% 0%, rgba(100,60,180,0.08) 0%, transparent 55%), radial-gradient(ellipse at 60% 15%, rgba(139,108,192,0.03) 0%, transparent 50%)";
    case "dawn":
      return "radial-gradient(ellipse at 50% 0%, rgba(245,184,61,0.06) 0%, transparent 50%), radial-gradient(ellipse at 30% 10%, rgba(169,143,216,0.04) 0%, transparent 55%)";
    case "morning":
      return "radial-gradient(ellipse at 40% 0%, rgba(245,184,61,0.05) 0%, transparent 55%), radial-gradient(ellipse at 70% 5%, rgba(255,210,106,0.03) 0%, transparent 50%)";
    case "daytime":
      return "radial-gradient(ellipse at 30% 0%, rgba(169,143,216,0.03) 0%, transparent 60%), radial-gradient(ellipse at 70% 10%, rgba(245,184,61,0.02) 0%, transparent 50%)";
  }
}

type Props = {
  nickname?: string;
  hour: number;
};

export function GreetingHeader({ nickname, hour }: Props) {
  const slot = getTimeSlot(hour);
  const { message, sub } = TIME_GREETINGS[slot];
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-4 overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-surface-card to-surface-elevated px-5 py-5"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            slot === "dawn" || slot === "morning"
              ? "radial-gradient(ellipse at 80% 30%, rgba(245,184,61,0.08) 0%, transparent 60%)"
              : "radial-gradient(ellipse at 80% 30%, rgba(169,143,216,0.08) 0%, transparent 60%)",
        }}
      />
      <div className="relative">
        <p className="mb-1 text-lg font-bold text-content">
          {nickname ? `${nickname}さん、` : ""}
          {message}
        </p>
        <p className="text-sm text-content-secondary">{sub}</p>
      </div>
    </motion.div>
  );
}
