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
  avatarUrl?: string | null;
  isPremium?: boolean;
  onAvatarClick?: () => void;
};

export function GreetingHeader({ nickname, hour, avatarUrl, isPremium, onAvatarClick }: Props) {
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
      <div className="relative flex items-center gap-4">
        {/* アバター */}
        {onAvatarClick && (
          <button
            type="button"
            onClick={onAvatarClick}
            className="group relative shrink-0"
            aria-label="プロフィール・設定を開く"
          >
            {/* プレミアム時の金色の輝くリング */}
            {isPremium && (
              <>
                <motion.span
                  aria-hidden="true"
                  className="absolute -inset-1 rounded-full opacity-60 blur-md"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #F5B83D, #FFE081, #F5B83D, #D49A2A, #FFE081, #F5B83D)",
                  }}
                  animate={reduced ? undefined : { rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-[-2px] rounded-full"
                  style={{
                    background:
                      "conic-gradient(from 0deg, #F5B83D, #FFE081, #F5B83D, #D49A2A, #FFE081, #F5B83D)",
                  }}
                />
              </>
            )}
            <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary/30 to-accent/20 ring-1 ring-border">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-base font-bold text-primary">
                  {nickname?.trim().charAt(0).toUpperCase() || "?"}
                </span>
              )}
            </span>
            {/* プレミアム王冠 */}
            {isPremium && (
              <motion.span
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-md ring-2 ring-surface"
                aria-label="プレミアム"
                animate={reduced ? undefined : { y: [0, -1.5, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 3h14v2H5v-2z" />
                </svg>
              </motion.span>
            )}
          </button>
        )}

        {/* 挨拶テキスト */}
        <div className="min-w-0 flex-1">
          <p className="mb-1 flex items-center gap-1.5 text-lg font-bold text-content">
            {nickname ? (
              <span className={isPremium ? "bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent" : ""}>
                {nickname}さん、
              </span>
            ) : null}
            <span>{message}</span>
          </p>
          <p className="truncate text-sm text-content-secondary">{sub}</p>
        </div>
      </div>
    </motion.div>
  );
}
