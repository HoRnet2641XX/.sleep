"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  count: number;
  onClick: () => void;
  disabled?: boolean;
};

/**
 * コメントボタン。タップ時に吹き出しが跳ねる + 三点リーダーが流れるアニメ。
 */
export function AnimatedCommentButton({ count, onClick, disabled }: Props) {
  const [pulse, setPulse] = useState(false);

  const handleClick = useCallback(() => {
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
    onClick();
  }, [onClick]);

  const hasComments = count > 0;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`relative flex min-h-[40px] items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-micro ${
        hasComments
          ? "text-info"
          : "text-content-muted hover:bg-surface-elevated hover:text-content-secondary"
      }`}
      aria-label="コメントを見る"
    >
      {/* 吹き出しアイコン: 押下時に軽く跳ねる */}
      <motion.svg
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill={hasComments ? "currentColor" : "none"}
        fillOpacity={hasComments ? 0.15 : 0}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
        animate={pulse ? { scale: [1, 1.25, 0.95, 1.08, 1], rotate: [0, -6, 6, -3, 0] } : { scale: 1, rotate: 0 }}
        transition={pulse ? { duration: 0.4, ease: "easeOut" } : { duration: 0.15 }}
      >
        <path
          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 三点リーダー */}
        <motion.circle
          cx="8"
          cy="10"
          r="0.9"
          fill="currentColor"
          stroke="none"
          animate={pulse ? { opacity: [0.3, 1, 0.3] } : { opacity: hasComments ? 0.6 : 0 }}
          transition={pulse ? { duration: 0.8, delay: 0, repeat: 0 } : { duration: 0.2 }}
        />
        <motion.circle
          cx="12"
          cy="10"
          r="0.9"
          fill="currentColor"
          stroke="none"
          animate={pulse ? { opacity: [0.3, 1, 0.3] } : { opacity: hasComments ? 0.6 : 0 }}
          transition={pulse ? { duration: 0.8, delay: 0.1, repeat: 0 } : { duration: 0.2 }}
        />
        <motion.circle
          cx="16"
          cy="10"
          r="0.9"
          fill="currentColor"
          stroke="none"
          animate={pulse ? { opacity: [0.3, 1, 0.3] } : { opacity: hasComments ? 0.6 : 0 }}
          transition={pulse ? { duration: 0.8, delay: 0.2, repeat: 0 } : { duration: 0.2 }}
        />
      </motion.svg>

      {/* カウント/ラベル */}
      <span className="relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={hasComments ? count : "empty"}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {hasComments ? `${count}件` : "コメントする"}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
