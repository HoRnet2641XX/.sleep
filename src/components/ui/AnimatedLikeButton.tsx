"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  liked: boolean;
  count: number;
  onToggle: () => void;
  disabled?: boolean;
};

/** パーティクル1個分 */
function Particle({ angle, delay }: { angle: number; delay: number }) {
  const rad = (angle * Math.PI) / 180;
  const distance = 18 + Math.random() * 10;
  return (
    <motion.span
      initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      animate={{
        opacity: 0,
        x: Math.cos(rad) * distance,
        y: Math.sin(rad) * distance,
        scale: 0,
      }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-400"
      aria-hidden="true"
    />
  );
}

/** リングエフェクト */
function RingBurst() {
  return (
    <motion.span
      initial={{ opacity: 0.6, scale: 0.2 }}
      animate={{ opacity: 0, scale: 2.2 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rose-400"
      aria-hidden="true"
    />
  );
}

const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function AnimatedLikeButton({ liked, count, onToggle, disabled }: Props) {
  const [burst, setBurst] = useState(false);

  const handleClick = useCallback(() => {
    if (!liked) {
      setBurst(true);
      setTimeout(() => setBurst(false), 600);
    }
    onToggle();
  }, [liked, onToggle]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-micro ${
        liked
          ? "bg-rose-500/10 text-rose-400"
          : "text-content-secondary hover:bg-surface-elevated"
      }`}
      aria-label={liked ? "いいねを取り消す" : "いいねする"}
      aria-pressed={liked}
    >
      {/* パーティクル */}
      <span className="pointer-events-none absolute left-[18px] top-1/2">
        <AnimatePresence>
          {burst && (
            <>
              <RingBurst />
              {PARTICLE_ANGLES.map((angle, i) => (
                <Particle key={angle} angle={angle} delay={i * 0.02} />
              ))}
            </>
          )}
        </AnimatePresence>
      </span>

      {/* ハートアイコン */}
      <motion.svg
        className="h-[18px] w-[18px]"
        viewBox="0 0 24 24"
        fill={liked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
        animate={liked ? { scale: [1, 1.35, 0.9, 1.1, 1] } : { scale: 1 }}
        transition={liked ? { duration: 0.45, ease: "easeOut" } : { duration: 0.15 }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </motion.svg>

      {/* カウント */}
      <span className="relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={count}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -12, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {count}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
