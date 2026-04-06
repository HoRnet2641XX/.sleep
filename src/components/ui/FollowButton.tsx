"use client";

import { motion } from "framer-motion";

type Props = {
  isFollowing: boolean;
  loading: boolean;
  onToggle: () => void;
};

export function FollowButton({ isFollowing, loading, onToggle }: Props) {
  if (loading) {
    return (
      <div className="h-9 w-28 animate-pulse rounded-lg bg-surface-elevated" />
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.95 }}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        isFollowing
          ? "border border-border bg-surface-card text-content-secondary hover:border-error/50 hover:text-error"
          : "bg-primary text-white hover:bg-primary-hover"
      }`}
    >
      {isFollowing ? "フォロー中" : "フォローする"}
    </motion.button>
  );
}
