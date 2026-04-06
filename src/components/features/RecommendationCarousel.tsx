"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReviewWithUser } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { StarRating } from "@/components/ui/StarRating";

type Props = {
  recommendations: ReviewWithUser[];
};

export function RecommendationCarousel({ recommendations }: Props) {
  if (recommendations.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mb-6"
      aria-label="あなたへのおすすめ"
    >
      <h2 className="mb-3 pl-1 text-sm font-semibold text-content-secondary">
        あなたへのおすすめ
      </h2>
      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
        {recommendations.map((review) => (
          <Link
            key={review.id}
            href={`/review/${review.id}`}
            className="w-48 flex-shrink-0 snap-start rounded-xl border border-border bg-surface-card p-4 transition-colors hover:border-primary/30"
          >
            <span className="mb-2 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {CATEGORY_LABELS[review.category]}
            </span>
            <p className="mb-2 truncate text-sm font-bold text-content">
              {review.productName}
            </p>
            <div className="mb-2">
              <StarRating rating={review.rating} size="sm" />
            </div>
            <p className="truncate text-xs text-content-muted">
              by {review.user.nickname}
            </p>
          </Link>
        ))}
      </div>
    </motion.section>
  );
}
