"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { MatchNotification } from "@/hooks/useMatchNotifications";
import { CATEGORY_LABELS } from "@/types";
import { StarRating } from "@/components/ui/StarRating";

type Props = {
  notifications: MatchNotification[];
};

export function MatchNotifications({ notifications }: Props) {
  const reduced = useReducedMotion();

  if (notifications.length === 0) return null;

  return (
    <motion.section
      initial={reduced ? { opacity: 1 } : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-5"
      aria-label="同じ症状の人の新着レビュー"
    >
      <div className="mb-3 flex items-center gap-2">
        <svg className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h2 className="text-sm font-semibold text-content">
          同じ症状の人が投稿しました
        </h2>
      </div>

      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {notifications.map((n) => (
          <Link
            key={n.review.id}
            href={`/review/${n.review.id}`}
            className="w-56 flex-shrink-0 snap-start rounded-xl border border-border/50 bg-surface-card p-4 transition-colors hover:border-primary/25"
          >
            {/* マッチタグ */}
            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {n.label}
            </span>

            {/* 製品情報 */}
            <p className="mb-1 truncate text-sm font-bold text-content">
              {n.review.productName}
            </p>
            <div className="mb-2 flex items-center gap-2">
              <StarRating rating={n.review.rating} size="sm" />
              <span className="text-xs text-content-muted">
                {CATEGORY_LABELS[n.review.category]}
              </span>
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-content-secondary">
              {n.review.body}
            </p>
            <p className="mt-2 truncate text-xs text-content-muted">
              by {n.review.user.nickname}
            </p>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
