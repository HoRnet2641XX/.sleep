"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { mapRow } from "@/components/features/HomeFeed";
import type { ReviewWithUser } from "@/types";
import { CATEGORY_LABELS, EFFECT_LABELS } from "@/types";
import { StarRating } from "@/components/ui/StarRating";

const fadeInUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

/** レビューアイコン SVG */
function ReviewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

/** コミュニティアイコン SVG */
function CommunityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

/** ターゲットアイコン SVG */
function TargetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function LandingPage() {
  const [sampleReviews, setSampleReviews] = useState<ReviewWithUser[]>([]);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("*, profiles(*)")
      .order("likes_count", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) {
          setSampleReviews(data.map((row) => mapRow(row as Record<string, unknown>)));
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* 背景グロー */}
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-[60vh]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(169,143,216,0.06) 0%, transparent 50%), radial-gradient(ellipse at 30% 20%, rgba(245,184,61,0.03) 0%, transparent 40%)",
        }}
      />

      {/* ナビバー */}
      <header className="relative z-10 border-b border-border/50 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-page items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src="/mascot.svg" alt=".nemuri" className="h-7 w-7" />
            <span className="text-xl font-bold tracking-tight text-content">.nemuri</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-content-secondary hover:text-content">
              ログイン
            </Link>
            <Link href="/signup" className="btn btn-primary text-sm">
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative z-10 mx-auto max-w-content px-4 pb-16 pt-16 text-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
          }}
        >
          <motion.div variants={fadeInUp}>
            <img src="/mascot.svg" alt=".nemuri マスコット" className="mx-auto mb-6 h-24 w-24" />
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="mb-4 text-4xl font-bold leading-tight text-content"
          >
            眠れない夜を、
            <br />
            ひとりにしない
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mb-8 max-w-sm text-base leading-relaxed text-content-secondary"
          >
            睡眠障害を抱える人同士が「自分に効いたもの」を共有し合う、レビュープラットフォーム。
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col items-center gap-3">
            <Link href="/signup" className="btn btn-primary px-8 py-3 text-base">
              無料でアカウント作成
            </Link>
            <Link href="/login" className="text-sm text-content-muted hover:text-primary">
              すでにアカウントをお持ちの方
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── 価値提案 ─── */}
      <section className="relative z-10 border-t border-border/30 bg-surface-card/30 py-16">
        <div className="mx-auto max-w-content px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
            className="space-y-6"
          >
            {[
              {
                icon: ReviewIcon,
                title: "リアルなレビュー",
                desc: "薬、寝具、生活習慣。実際に試した人の体験だけが集まります。使用期間や効果レベルまで記録できるから、信頼できる。",
              },
              {
                icon: CommunityIcon,
                title: "同じ悩みの仲間",
                desc: "入眠困難、中途覚醒、早朝覚醒。同じ症状を持つ人のレビューを見つけて、つながれます。",
              },
              {
                icon: TargetIcon,
                title: "あなたに合った提案",
                desc: "プロフィールに睡眠の悩みを設定すると、似た人に効いたアイテムをおすすめします。",
              },
            ].map((item) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                className="rounded-xl border border-border bg-surface-card p-6"
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-content">{item.title}</h3>
                <p className="text-sm leading-relaxed text-content-secondary">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── サンプルレビュー ─── */}
      {sampleReviews.length > 0 && (
        <section className="relative z-10 py-16">
          <div className="mx-auto max-w-content px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              <motion.h2
                variants={fadeInUp}
                className="mb-8 text-center text-2xl font-bold text-content"
              >
                みんなのレビュー
              </motion.h2>
              <div className="space-y-4">
                {sampleReviews.map((review) => (
                  <motion.div
                    key={review.id}
                    variants={fadeInUp}
                    className="rounded-xl border border-border bg-surface-card p-5"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        {CATEGORY_LABELS[review.category]}
                      </span>
                      <span className="text-xs text-content-muted">
                        by {review.user.nickname}
                      </span>
                    </div>
                    <h3 className="mb-2 font-bold text-content">{review.productName}</h3>
                    <div className="mb-2 flex items-center gap-3">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-xs text-content-secondary">
                        効果: {EFFECT_LABELS[review.effectLevel]}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm text-content-secondary">{review.body}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── CTA フッター ─── */}
      <section className="relative z-10 border-t border-border/30 bg-surface-card/30 py-16">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mx-auto max-w-content px-4 text-center"
        >
          <img src="/mascot.svg" alt="" className="mx-auto mb-4 h-16 w-16 opacity-60" aria-hidden="true" />
          <h2 className="mb-3 text-2xl font-bold text-content">
            今夜から、はじめてみませんか？
          </h2>
          <p className="mb-6 text-sm text-content-secondary">
            あなたの体験が、誰かの眠りを変えるかもしれません。
          </p>
          <Link href="/signup" className="btn btn-primary px-8 py-3 text-base">
            無料でアカウント作成
          </Link>
        </motion.div>
      </section>

      {/* フッター */}
      <footer className="relative z-10 border-t border-border/30 py-6 text-center">
        <p className="text-xs text-content-muted">&copy; 2026 .nemuri</p>
      </footer>
    </div>
  );
}
