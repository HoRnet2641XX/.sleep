"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform, useInView } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { mapReviewRow } from "@/lib/mapReview";
import type { ReviewWithUser } from "@/types";
import { CATEGORY_LABELS, EFFECT_LABELS } from "@/types";
import { StarRating } from "@/components/ui/StarRating";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

const HeroSleepScene = dynamic(
  () =>
    import("@/components/features/HeroSleepScene").then(
      (m) => m.HeroSleepScene,
    ),
  { ssr: false },
);

/* ────────────────────────────────────────────
   ヒーロー: 巨大時計 + "今夜も起きている"
   ──────────────────────────────────────────── */
function HeroClock({ animated }: { animated: boolean }) {
  const [time, setTime] = useState("3:17");

  useEffect(() => {
    const h = new Date().getHours();
    // 22時〜6時の間はリアルタイム表示 → 共感を直撃
    if (h >= 22 || h < 6) {
      const tick = () => {
        const now = new Date();
        setTime(
          `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`,
        );
      };
      tick();
      const id = setInterval(tick, 10_000);
      return () => clearInterval(id);
    }
  }, []);

  return (
    <div className="relative select-none">
      <motion.span
        className="block bg-gradient-to-b from-content via-content to-content-muted bg-clip-text font-mono text-[min(28vw,180px)] font-extralight leading-none tracking-tighter text-transparent"
        initial={{ opacity: 0, letterSpacing: "0.1em" }}
        animate={{ opacity: 1, letterSpacing: "-0.04em" }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        {time}
      </motion.span>
      {/* ブリンクカーソル */}
      {animated && (
        <span className="animate-caret absolute -right-2 bottom-3 inline-block h-[40%] w-[3px] rounded-full bg-primary/60 sm:-right-4" />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────
   ティッカー: 生々しいレビュー断片が流れ続ける
   ──────────────────────────────────────────── */
const TICKER_FRAGMENTS = [
  "デパスをやめて3日目、震えが止まらなかった",
  "ウェイトブランケットで中途覚醒が週5→週2に",
  "メラトニン3mg、自分には合わなかった",
  "ASMR + 遮光カーテンの組み合わせが最強だった",
  "マットレスを変えたら腰痛と一緒に不眠も消えた",
  "認知行動療法、薬より効いた。ただし3ヶ月かかる",
  "枕を蕎麦殻に変えてから寝つきが20分短くなった",
  "ベルソムラ15mg、悪夢が増えて断念",
  "朝散歩15分、地味だけど一番効果があった",
  "入眠困難10年、ここで見つけたサプリで光が見えた",
];

function ReviewTicker() {
  // 2倍の配列で途切れないループ
  const items = [...TICKER_FRAGMENTS, ...TICKER_FRAGMENTS];
  return (
    <div className="relative overflow-hidden py-5" aria-hidden="true">
      {/* 左右のフェード */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-surface to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-surface to-transparent" />
      <div className="animate-ticker flex w-max gap-8">
        {items.map((text, i) => (
          <span
            key={i}
            className="shrink-0 whitespace-nowrap text-sm text-content-muted/70"
          >
            {text}
            <span className="ml-8 text-primary/30">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   フォンモックアップ: アプリ UI をそのまま見せる
   ──────────────────────────────────────────── */
function PhoneMockup({ reviews }: { reviews: ReviewWithUser[] }) {
  return (
    <div className="relative mx-auto w-[260px]">
      {/* フォンフレーム */}
      <div className="overflow-hidden rounded-[32px] border-2 border-border-light bg-surface shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        {/* ステータスバー */}
        <div className="flex items-center justify-between bg-surface px-5 pb-1 pt-3">
          <span className="text-[10px] text-content-muted">3:17</span>
          <div className="flex gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-content-muted/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-content-muted/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-content-muted/40" />
          </div>
        </div>
        {/* アプリヘッダー */}
        <div className="flex items-center gap-1.5 border-b border-border/60 bg-surface px-4 pb-2 pt-1">
          <img src="/mascot.svg" alt="" className="h-4 w-4" />
          <span className="text-xs font-bold text-content">.nemuri</span>
        </div>
        {/* レビューカード */}
        <div className="space-y-2 bg-surface p-3 pb-6">
          {reviews.slice(0, 2).map((r) => (
            <div
              key={r.id}
              className="rounded-lg border border-border/50 bg-surface-card p-3"
            >
              <div className="mb-1.5 flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[7px] font-bold text-primary">
                  {r.user.nickname.charAt(0)}
                </span>
                <span className="text-[9px] text-content-secondary">
                  {r.user.nickname}
                </span>
                <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[7px] text-primary">
                  {CATEGORY_LABELS[r.category]}
                </span>
              </div>
              <p className="mb-1 text-[10px] font-bold leading-snug text-content">
                {r.productName}
              </p>
              <div className="mb-1">
                <StarRating rating={r.rating} size="sm" />
              </div>
              <p className="line-clamp-2 text-[8px] leading-relaxed text-content-muted">
                {r.body}
              </p>
            </div>
          ))}
          {/* ゴーストカード */}
          <div className="rounded-lg border border-border/30 bg-surface-card/50 p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="h-4 w-4 rounded-full bg-surface-elevated" />
              <span className="h-2 w-12 rounded bg-surface-elevated" />
            </div>
            <span className="h-2 w-20 rounded bg-surface-elevated block mb-1" />
            <span className="h-1.5 w-full rounded bg-surface-elevated block" />
          </div>
        </div>
      </div>
      {/* ホームインジケータ */}
      <div className="mx-auto mt-1 h-1 w-20 rounded-full bg-content-muted/20" />
    </div>
  );
}

/* ────────────────────────────────────────────
   コンステレーション: 同じ夜の人々を星座で可視化
   ──────────────────────────────────────────── */
const CONSTELLATION_NODES = [
  { x: 15, y: 25, label: "入眠困難", delay: 0 },
  { x: 72, y: 18, label: "中途覚醒", delay: 0.15 },
  { x: 45, y: 60, label: "早朝覚醒", delay: 0.3 },
  { x: 85, y: 55, label: "入眠困難", delay: 0.45 },
  { x: 30, y: 80, label: "中途覚醒", delay: 0.6 },
  { x: 60, y: 35, label: "あなた", delay: 0.75 },
];
const CONSTELLATION_LINES = [
  [5, 0],
  [5, 1],
  [5, 2],
  [1, 3],
  [2, 4],
  [0, 2],
];

/* ────────────────────────────────────────────
   Community ヘッダー: 一文字ずつ灯るアニメーション
   ──────────────────────────────────────────── */
const COMMUNITY_HEADING = "今夜も、誰かが起きている";

function CommunityHeading({ animated }: { animated: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const chars = COMMUNITY_HEADING.split("");

  return (
    <div ref={ref} className="mb-8 text-center">
      {/* "community" ラベル */}
      <motion.p
        initial={{ opacity: 0, letterSpacing: "0.6em" }}
        animate={
          isInView
            ? { opacity: 1, letterSpacing: "0.3em" }
            : { opacity: 0, letterSpacing: "0.6em" }
        }
        transition={{ duration: animated ? 0.8 : 0.01, ease: "easeOut" }}
        className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-accent/70"
      >
        community
      </motion.p>

      {/* メイン見出し: 一文字ずつフェードイン */}
      <h2 className="text-2xl font-bold leading-tight text-content md:text-3xl">
        {chars.map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
            animate={
              isInView
                ? { opacity: 1, y: 0, filter: "blur(0px)" }
                : { opacity: 0, y: 12, filter: "blur(4px)" }
            }
            transition={{
              duration: animated ? 0.4 : 0.01,
              delay: animated ? 0.3 + i * 0.06 : 0,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="inline-block"
            style={char === "、" ? { marginRight: "0.1em" } : undefined}
          >
            {char}
          </motion.span>
        ))}
      </h2>

      {/* 見出し下のほのかな光パルス */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={
          isInView
            ? { opacity: 1, scaleX: 1 }
            : { opacity: 0, scaleX: 0 }
        }
        transition={{
          duration: animated ? 0.8 : 0.01,
          delay: animated ? 1.0 : 0,
          ease: "easeOut",
        }}
        className="mx-auto mt-4 h-px w-24 origin-center"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(169,143,216,0.5), rgba(245,184,61,0.4), transparent)",
        }}
      />
      {animated && isInView && (
        <motion.div
          className="mx-auto mt-1 h-px w-24"
          animate={{ opacity: [0, 0.6, 0], scaleX: [0.8, 1.1, 0.8] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(169,143,216,0.3), transparent)",
          }}
        />
      )}
    </div>
  );
}

/**
 * 各ノードごとにランダムな漂流オフセットを生成する。
 * period(秒) と amplitude(SVG座標単位) はノードごとに異なり、
 * 有機的な動きを生み出す。
 */
const DRIFT_PARAMS = CONSTELLATION_NODES.map((_, i) => ({
  ax: 1.2 + (i % 3) * 0.6,       // X振幅
  ay: 1.0 + ((i + 1) % 3) * 0.5, // Y振幅
  px: 4 + i * 1.3,                // X周期(秒)
  py: 5 + i * 1.1,                // Y周期(秒)
  phase: i * 1.2,                 // 位相ずらし
}));

function useDriftPositions(animated: boolean) {
  const [positions, setPositions] = useState(
    CONSTELLATION_NODES.map((n) => ({ x: n.x, y: n.y })),
  );

  useEffect(() => {
    if (!animated) return;
    let raf: number;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;
      setPositions(
        CONSTELLATION_NODES.map((node, i) => {
          const d = DRIFT_PARAMS[i];
          return {
            x: node.x + Math.sin((t + d.phase) / d.px * Math.PI * 2) * d.ax,
            y: node.y + Math.cos((t + d.phase) / d.py * Math.PI * 2) * d.ay,
          };
        }),
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [animated]);

  return positions;
}

function Constellation({ animated }: { animated: boolean }) {
  const positions = useDriftPositions(animated);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="relative mx-auto aspect-[4/3] max-w-md" aria-hidden="true">
      {/* 線: ノード位置に追従 */}
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
        {CONSTELLATION_LINES.map(([a, b], i) => (
          <motion.line
            key={i}
            x1={positions[a].x}
            y1={positions[a].y}
            x2={positions[b].x}
            y2={positions[b].y}
            stroke="rgba(169,143,216,0.15)"
            strokeWidth="0.3"
            initial={{ pathLength: 0 }}
            animate={isInView ? { pathLength: 1 } : { pathLength: 0 }}
            transition={{ duration: animated ? 1.2 : 0.01, delay: animated ? i * 0.1 : 0 }}
          />
        ))}
      </svg>

      {/* ノード */}
      {CONSTELLATION_NODES.map((node, i) => {
        const isYou = node.label === "あなた";
        return (
          <motion.div
            key={i}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${positions[i].x}%`, top: `${positions[i].y}%` }}
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{
              duration: animated ? 0.5 : 0.01,
              delay: animated ? node.delay : 0,
              type: "spring",
              stiffness: 200,
            }}
          >
            {/* パルスリング */}
            {isYou && animated && (
              <motion.span
                className="absolute inset-0 rounded-full border border-accent/50"
                animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
            )}
            {/* 他ノードの呼吸グロー */}
            {!isYou && animated && (
              <motion.span
                className="absolute inset-[-3px] rounded-full bg-primary/20"
                animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                transition={{
                  duration: 3 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.4,
                }}
              />
            )}
            <span
              className={`relative z-10 block rounded-full ${
                isYou
                  ? "h-4 w-4 bg-accent shadow-[0_0_20px_rgba(245,184,61,0.5)]"
                  : "h-2.5 w-2.5 bg-primary/80 shadow-[0_0_12px_rgba(169,143,216,0.4)]"
              }`}
            />
            <span
              className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] ${
                isYou
                  ? "top-6 font-bold text-accent"
                  : "top-5 text-content-muted/60"
              }`}
            >
              {node.label}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────
   数字カウンター (intersection でアニメ)
   ──────────────────────────────────────────── */
function Counter({
  to,
  suffix,
  animated,
}: {
  to: number;
  suffix: string;
  animated: boolean;
}) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started || !animated) {
      setVal(to);
      return;
    }
    let frame: number;
    const dur = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      // easeOutExpo
      const ease = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setVal(Math.round(ease * to));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [started, to, animated]);

  return (
    <motion.span
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true }}
      className="tabular-nums"
    >
      {val.toLocaleString()}
      {suffix}
    </motion.span>
  );
}

/* ════════════════════════════════════════════
   LP 本体
   ════════════════════════════════════════════ */
export function LandingPage() {
  const [sampleReviews, setSampleReviews] = useState<ReviewWithUser[]>([]);
  const shouldReduceMotion = useReducedMotion();
  const animated = !shouldReduceMotion;

  // パララックス用
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.96]);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("*, profiles(*)")
      .order("likes_count", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        if (data) {
          setSampleReviews(
            data.map((row) => mapReviewRow(row as Record<string, unknown>)),
          );
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-surface">
      {/* ─── 1. HERO: 巨大時計 ─── */}
      <section className="relative flex min-h-screen flex-col overflow-hidden">
        {/* three.js 背景 */}
        <div className="pointer-events-none absolute inset-0">
          <HeroSleepScene />
        </div>

        {/* ナビ */}
        <header className="relative z-20 flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            <img src="/mascot.svg" alt=".nemuri" className="h-6 w-6" />
            <span className="text-sm font-bold tracking-tight text-content/80">
              .nemuri
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-medium text-content-muted hover:text-content"
            >
              ログイン
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-content/10 px-4 py-1.5 text-xs font-medium text-content backdrop-blur-sm transition hover:bg-content/20"
            >
              無料で始める
            </Link>
          </div>
        </header>

        {/* 時計 + コピー */}
        <motion.div
          className="relative z-10 flex flex-1 flex-col items-center justify-center px-4"
          style={animated ? { opacity: heroOpacity, scale: heroScale } : {}}
        >
          <HeroClock animated={animated} />
          <motion.p
            className="mt-6 text-center text-lg leading-relaxed tracking-wide text-content-secondary"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            また、起きてしまった。
          </motion.p>
          <motion.p
            className="mt-2 text-center text-sm text-content-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            あなただけじゃない。
          </motion.p>

          {/* スクロール誘導 */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            <motion.svg
              className="h-6 w-6 text-content-muted/40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
              animate={animated ? { y: [0, 6, 0] } : undefined}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <path
                d="M12 5v14M5 12l7 7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── 2. ティッカー: 生の声が流れる ─── */}
      <section className="relative z-10 border-y border-border/20">
        <ReviewTicker />
      </section>

      {/* ─── 3. 叙情テキスト + プロダクトショット ─── */}
      <section className="relative z-10 overflow-hidden py-24">
        <div className="mx-auto grid max-w-page items-center gap-12 px-5 md:grid-cols-2 md:gap-8">
          {/* 左: テキスト */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-6 text-xs font-medium uppercase tracking-[0.3em] text-primary/70">
              what is .nemuri
            </p>
            <h2 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-content md:text-4xl">
              眠れない夜を、
              <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ひとりにしない。
              </span>
            </h2>
            <p className="mb-4 max-w-sm text-sm leading-[1.9] text-content-secondary">
              薬、サプリ、マットレス、生活習慣——
              <br />
              試した人だけが知っている「本音」を
              <br />
              共有する、睡眠障害のためのレビューSNS。
            </p>
            <p className="max-w-sm text-sm leading-[1.9] text-content-muted">
              使用期間も、副作用も、効かなかった理由も。
              <br />
              広告には載らないリアルだけ。
            </p>
          </motion.div>

          {/* 右: フォンモック */}
          <motion.div
            initial={{ opacity: 0, y: 60, rotateY: -8 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: animated ? 0.9 : 0.01,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="flex justify-center"
          >
            <PhoneMockup reviews={sampleReviews} />
          </motion.div>
        </div>
      </section>

      {/* ─── 4. 星座: 同じ夜の人々 ─── */}
      <section className="relative z-10 border-t border-border/20 py-24">
        {/* 背景のグロー */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, rgba(169,143,216,0.04) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-content px-5">
          <CommunityHeading animated={animated} />

          <Constellation animated={animated} />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mx-auto mt-8 max-w-sm text-center text-sm leading-[1.9] text-content-secondary"
          >
            入眠困難、中途覚醒、早朝覚醒——
            <br />
            あなたと同じ症状を持つ人のレビューを
            <br />
            優先して届けます。
          </motion.p>
        </div>
      </section>

      {/* ─── 5. 数字で語る ─── */}
      <section className="relative z-10 border-t border-border/20 py-20">
        <div className="mx-auto grid max-w-content grid-cols-3 gap-4 px-5">
          {[
            { n: 2400, s: "万人", sub: "日本の不眠症有病者数" },
            { n: 73, s: "%", sub: "が3つ以上の対策を試行" },
            { n: 4, s: ".2時間", sub: "平均入眠までの時間" },
          ].map((stat, i) => (
            <motion.div
              key={stat.sub}
              className="text-center"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: animated ? 0.5 : 0.01,
                delay: animated ? i * 0.12 : 0,
              }}
            >
              <p className="text-2xl font-bold text-content md:text-3xl">
                <Counter to={stat.n} suffix={stat.s} animated={animated} />
              </p>
              <p className="mt-1 text-xs text-content-muted">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── 6. サンプルレビュー(横スクロール) ─── */}
      {sampleReviews.length > 0 && (
        <section className="relative z-10 border-t border-border/20 py-24">
          <div className="mx-auto max-w-page px-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-primary/70">
                reviews
              </p>
              <h2 className="text-2xl font-bold text-content md:text-3xl">
                今、読まれている体験
              </h2>
              <p className="mt-2 text-sm text-content-muted">
                登録しなくても読めます
              </p>
            </motion.div>

            <div className="scrollbar-none -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4">
              {sampleReviews.map((review, i) => (
                <motion.article
                  key={review.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: animated ? 0.5 : 0.01,
                    delay: animated ? i * 0.1 : 0,
                  }}
                  className="w-[300px] flex-shrink-0 snap-start rounded-2xl border border-border bg-surface-card p-5 md:w-[340px]"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {review.user.nickname.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-content">
                        {review.user.nickname}
                      </p>
                      <p className="text-xs text-content-muted">
                        {review.user.sleepDisorderTypes.join(" · ") || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <CategoryIcon
                      category={review.category}
                      className="h-3.5 w-3.5 text-primary"
                    />
                    <span className="text-xs text-primary">
                      {CATEGORY_LABELS[review.category]}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base font-bold text-content">
                    {review.productName}
                  </h3>
                  <div className="mb-3 flex items-center gap-3">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-content-secondary">
                      効果: {EFFECT_LABELS[review.effectLevel]}
                    </span>
                  </div>
                  <p className="line-clamp-3 text-sm leading-relaxed text-content-secondary">
                    {review.body}
                  </p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── 7. CTA: 夜明け ─── */}
      <section className="relative z-10 overflow-hidden py-28">
        {/* アンバーグロー: 夜明けの比喩 */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(245,184,61,0.06) 0%, transparent 50%), radial-gradient(ellipse at 50% 0%, rgba(169,143,216,0.04) 0%, transparent 40%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-content px-5 text-center"
        >
          {/* マスコット: 呼吸 */}
          <motion.div className="relative mx-auto mb-8 h-20 w-20">
            <motion.div
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(245,184,61,0.25) 0%, transparent 60%)",
              }}
              animate={
                animated
                  ? { scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }
                  : undefined
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.img
              src="/mascot.svg"
              alt=""
              className="relative mx-auto h-20 w-20"
              aria-hidden="true"
              animate={animated ? { scale: [1, 1.05, 1] } : undefined}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <h2 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-content md:text-4xl">
            夜明けは、
            <br />
            誰かの体験の先にある。
          </h2>
          <p className="mx-auto mb-8 max-w-xs text-sm leading-[1.9] text-content-secondary">
            あなたの「効かなかった」も、
            <br />
            明日の誰かを救うかもしれない。
          </p>

          <Link
            href="/signup"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-primary px-10 py-4 text-base font-medium text-white transition-all hover:shadow-[0_12px_40px_rgba(169,143,216,0.4)]"
          >
            <span className="relative z-10">無料で始める</span>
            {/* ホバーシマー */}
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
          </Link>

          <p className="mt-5 text-xs text-content-muted">
            メール / Google / X で30秒
          </p>
        </motion.div>
      </section>

      {/* フッター */}
      <footer className="relative z-10 border-t border-border/20 py-6 text-center">
        <p className="text-xs text-content-muted">&copy; 2026 .nemuri</p>
      </footer>
    </div>
  );
}
