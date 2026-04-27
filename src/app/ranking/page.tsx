"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { CATEGORY_LABELS } from "@/types";
import type { ReviewCategory } from "@/types";
import { StarRating } from "@/components/ui/StarRating";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

type Period = "week" | "month" | "all";

type RankedProduct = {
  productName: string;
  category: ReviewCategory;
  avgRating: number;
  reviewCount: number;
  topReviewId: string;
};

const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "週間" },
  { key: "month", label: "月間" },
  { key: "all", label: "全期間" },
];

const CATEGORIES: { key: ReviewCategory | "all"; label: string }[] = [
  { key: "all", label: "すべて" },
  { key: "medicine", label: "薬" },
  { key: "mattress", label: "マットレス" },
  { key: "pillow", label: "枕" },
  { key: "chair", label: "椅子" },
  { key: "habit", label: "生活習慣" },
];

export default function RankingPage() {
  const reduced = useReducedMotion();
  const [period, setPeriod] = useState<Period>("week");
  const [category, setCategory] = useState<ReviewCategory | "all">("all");
  const [products, setProducts] = useState<RankedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRanking = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from("reviews")
      .select("id, product_name, category, rating, likes_count, created_at");

    // 期間フィルタ
    if (period === "week") {
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", since);
    } else if (period === "month") {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte("created_at", since);
    }

    // カテゴリフィルタ
    if (category !== "all") {
      query = query.eq("category", category);
    }

    const { data } = await query.order("likes_count", { ascending: false }).limit(200);

    if (!data || data.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    // product_name でグルーピングして集計
    const grouped: Record<
      string,
      {
        category: ReviewCategory;
        ratings: number[];
        totalLikes: number;
        topReviewId: string;
        topLikes: number;
      }
    > = {};

    for (const row of data) {
      const name = row.product_name as string;
      if (!grouped[name]) {
        grouped[name] = {
          category: row.category as ReviewCategory,
          ratings: [],
          totalLikes: 0,
          topReviewId: row.id as string,
          topLikes: row.likes_count as number,
        };
      }
      grouped[name].ratings.push(row.rating as number);
      grouped[name].totalLikes += row.likes_count as number;
      if ((row.likes_count as number) > grouped[name].topLikes) {
        grouped[name].topLikes = row.likes_count as number;
        grouped[name].topReviewId = row.id as string;
      }
    }

    const ranked: RankedProduct[] = Object.entries(grouped)
      .map(([name, g]) => ({
        productName: name,
        category: g.category,
        avgRating:
          Math.round(
            (g.ratings.reduce((a, b) => a + b, 0) / g.ratings.length) * 10,
          ) / 10,
        reviewCount: g.ratings.length,
        topReviewId: g.topReviewId,
      }))
      .sort((a, b) => {
        // スコア = レビュー数 × 平均評価 (ベイズ推定的な重み)
        const scoreA = a.reviewCount * a.avgRating;
        const scoreB = b.reviewCount * b.avgRating;
        return scoreB - scoreA;
      })
      .slice(0, 20);

    setProducts(ranked);
    setLoading(false);
  }, [period, category]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const getMedalColor = (rank: number) => {
    if (rank === 0) return "text-amber-400";
    if (rank === 1) return "text-content-secondary";
    if (rank === 2) return "text-amber-500/60";
    return "text-content-muted";
  };

  return (
    <div className="min-h-screen">
      {/* ヘッダー */}
      <header className="sticky top-0 z-20 border-b border-border bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto max-w-content px-4 py-3">
          <div className="mb-3 flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center text-content-secondary hover:text-content"
              aria-label="ホームに戻る"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <h1 className="text-lg font-bold text-content">ランキング</h1>
          </div>

          {/* 期間タブ */}
          <div className="mb-3 flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors duration-micro ${
                  period === p.key
                    ? "bg-primary/15 text-primary"
                    : "text-content-muted hover:bg-surface-elevated hover:text-content-secondary"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* カテゴリフィルタ */}
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                aria-pressed={category === c.key}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-micro ${
                  category === c.key
                    ? "bg-primary/15 text-primary ring-1 ring-primary/20"
                    : "bg-surface-elevated text-content-muted hover:text-content-secondary"
                }`}
              >
                {c.key !== "all" && (
                  <CategoryIcon
                    category={c.key}
                    className="h-3.5 w-3.5 opacity-70"
                  />
                )}
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ランキング一覧 */}
      <main className="mx-auto max-w-content px-4 pb-24 pt-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-surface-elevated" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-surface-elevated" />
                    <div className="h-3 w-24 rounded bg-surface-elevated" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-2">
            {products.map((product, i) => (
              <motion.div
                key={product.productName}
                initial={reduced ? { opacity: 1 } : { opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <Link
                  href={`/review/${product.topReviewId}`}
                  className="flex items-center gap-4 rounded-xl border border-border/50 bg-surface-card px-4 py-4 transition-colors hover:border-primary/20 hover:bg-surface-elevated/50"
                >
                  {/* 順位 */}
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center text-lg font-bold ${getMedalColor(i)}`}>
                    {i < 3 ? (
                      <span>{["1st", "2nd", "3rd"][i]}</span>
                    ) : (
                      <span className="text-sm">{i + 1}</span>
                    )}
                  </div>

                  {/* 製品情報 */}
                  <div className="min-w-0 flex-1">
                    <p className="mb-1 truncate text-sm font-bold text-content">
                      {product.productName}
                    </p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={product.avgRating} size="sm" />
                      <span className="text-xs text-content-muted">
                        {product.avgRating}
                      </span>
                    </div>
                  </div>

                  {/* メタ */}
                  <div className="shrink-0 text-right">
                    <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      <CategoryIcon
                        category={product.category}
                        className="h-3 w-3"
                      />
                      {CATEGORY_LABELS[product.category]}
                    </span>
                    <p className="mt-1 text-xs text-content-muted">
                      {product.reviewCount}件のレビュー
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center">
            <svg className="mx-auto mb-4 h-12 w-12 text-content-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M8 21h8M12 17v4M6 13l-1.12-7.03A1 1 0 015.87 5h12.26a1 1 0 01.99.97L18 13M6 13h12M6 13l-2 4h16l-2-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mb-2 font-medium text-content">
              まだランキングデータがありません
            </p>
            <p className="text-sm text-content-secondary">
              レビューが集まるとランキングが表示されます
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
