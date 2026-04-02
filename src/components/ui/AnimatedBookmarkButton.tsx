"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  bookmarked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  label?: boolean;
};

/** 落ちてくる星エフェクト */
function FallingStar({ delay, x }: { delay: number; x: number }) {
  return (
    <motion.span
      initial={{ opacity: 1, y: -14, x, scale: 0.8 }}
      animate={{ opacity: 0, y: 8, x: x * 0.6, scale: 0 }}
      transition={{ duration: 0.55, delay, ease: "easeIn" }}
      className="absolute left-1/2 top-1/2 text-[8px] text-amber-400"
      aria-hidden="true"
    >
      <svg className="h-1.5 w-1.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </motion.span>
  );
}

const STARS = [
  { delay: 0, x: -8 },
  { delay: 0.05, x: 4 },
  { delay: 0.08, x: -3 },
  { delay: 0.12, x: 9 },
  { delay: 0.03, x: -11 },
];

export function AnimatedBookmarkButton({ bookmarked, onToggle, disabled, label = true }: Props) {
  const [sparkle, setSparkle] = useState(false);

  const handleClick = useCallback(() => {
    if (!bookmarked) {
      setSparkle(true);
      setTimeout(() => setSparkle(false), 700);
    }
    onToggle();
  }, [bookmarked, onToggle]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-micro ${
        bookmarked
          ? "bg-amber-500/10 text-amber-400"
          : "text-content-secondary hover:bg-surface-elevated"
      }`}
      aria-label={bookmarked ? "保存を取り消す" : "保存する"}
      aria-pressed={bookmarked}
    >
      {/* 星パーティクル */}
      <span className="pointer-events-none absolute left-[18px] top-1/2">
        <AnimatePresence>
          {sparkle &&
            STARS.map((s, i) => (
              <FallingStar key={i} delay={s.delay} x={s.x} />
            ))}
        </AnimatePresence>
      </span>

      {/* ブックマークアイコン */}
      <motion.svg
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
        animate={
          bookmarked
            ? { scale: [1, 0.7, 1.3, 1], rotate: [0, -12, 8, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={
          bookmarked
            ? { duration: 0.5, ease: "easeOut" }
            : { duration: 0.15 }
        }
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </motion.svg>

      {label && (
        <AnimatePresence mode="wait">
          <motion.span
            key={bookmarked ? "saved" : "save"}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.15 }}
          >
            {bookmarked ? "保存済み" : "保存"}
          </motion.span>
        </AnimatePresence>
      )}
    </button>
  );
}
