"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, useReducedMotion, useScroll, useTransform, useInView } from "framer-motion";
import { StarRating } from "@/components/ui/StarRating";

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
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
  });
  const [seconds, setSeconds] = useState(() =>
    String(new Date().getSeconds()).padStart(2, "0"),
  );

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`,
      );
      setSeconds(String(now.getSeconds()).padStart(2, "0"));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // 深夜帯かどうかでメッセージを変える
  const hour = new Date().getHours();
  const isLateNight = hour >= 22 || hour < 6;

  return (
    <div className="relative select-none text-center">
      {/* メイン時刻 */}
      <div className="relative inline-flex items-baseline">
        <motion.span
          className="block bg-gradient-to-b from-content via-content to-content-muted bg-clip-text font-mono text-[min(28vw,180px)] font-extralight leading-none tracking-tighter text-transparent"
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "-0.04em" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {time}
        </motion.span>
        {/* 秒数 — 小さく表示して "ライブ感" を演出 */}
        <motion.span
          className="ml-1 font-mono text-[min(6vw,36px)] font-extralight leading-none text-content-muted/40"
          key={seconds}
          initial={{ opacity: 0.2, y: -4 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {seconds}
        </motion.span>
        {/* ブリンクカーソル */}
        {animated && (
          <span className="animate-caret absolute -right-2 bottom-3 inline-block h-[40%] w-[3px] rounded-full bg-primary/60 sm:-right-4" />
        )}
      </div>

      {/* LIVE インジケーター */}
      <motion.div
        className="mt-3 flex items-center justify-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        {animated && (
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-error"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-content-muted/60">
          {isLateNight ? "live — 今、眠れない人がいる" : "live"}
        </span>
      </motion.div>
    </div>
  );
}

/* ────────────────────────────────────────────
   時間帯別ヒーローコピー
   ──────────────────────────────────────────── */
type HeroMessage = { main: string; sub: string };

const HERO_MESSAGES: Record<string, HeroMessage> = {
  lateNight: {
    main: "眠れない夜、ここにいるよ。",
    sub: "同じ時間を過ごしている人が、ここにいます。",
  },
  earlyMorning: {
    main: "朝が来たね。おつかれさま。",
    sub: "今日はゆっくりいこう。",
  },
  morning: {
    main: "自分に合うやり方、きっとある。",
    sub: "みんなの体験から、ヒントを探してみよう。",
  },
  afternoon: {
    main: "今夜のこと、少しだけ考えてみない？",
    sub: "誰かの「これ効いた」が見つかるかも。",
  },
  evening: {
    main: "今日もおつかれさま。",
    sub: "自分のペースで、眠りと付き合っていこう。",
  },
};

function getHeroMessage(): HeroMessage {
  const h = new Date().getHours();
  if (h >= 22 || h < 4) return HERO_MESSAGES.lateNight;
  if (h < 7) return HERO_MESSAGES.earlyMorning;
  if (h < 12) return HERO_MESSAGES.morning;
  if (h < 17) return HERO_MESSAGES.afternoon;
  return HERO_MESSAGES.evening;
}

function HeroCopy() {
  const [msg, setMsg] = useState<HeroMessage>(getHeroMessage);

  useEffect(() => {
    // 時間帯が変わったらメッセージも更新
    const id = setInterval(() => setMsg(getHeroMessage()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <motion.p
        className="mt-6 text-center text-lg leading-relaxed tracking-wide text-content-secondary"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        {msg.main}
      </motion.p>
      <motion.p
        className="mt-2 text-center text-sm text-content-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        {msg.sub}
      </motion.p>
    </>
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
function PhoneMockup() {
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
        {/* レビューカード（常にプレースホルダー表示） */}
        <div className="space-y-2 bg-surface p-3 pb-6">
              <div className="rounded-lg border border-border/50 bg-surface-card p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-[7px] font-bold text-primary">N</span>
                  <span className="text-[9px] text-content-secondary">nemuriさん</span>
                  <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[7px] text-primary">薬</span>
                </div>
                <p className="mb-1 text-[10px] font-bold leading-snug text-content">メラトニンサプリ 3mg</p>
                <div className="mb-1"><StarRating rating={4} size="sm" /></div>
                <p className="text-[8px] leading-relaxed text-content-muted">寝つきが30分くらい早くなった気がします。副作用もなく...</p>
              </div>
              <div className="rounded-lg border border-border/50 bg-surface-card p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-[7px] font-bold text-accent">Y</span>
                  <span className="text-[9px] text-content-secondary">yoru_tomoさん</span>
                  <span className="ml-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-[7px] text-primary">習慣</span>
                </div>
                <p className="mb-1 text-[10px] font-bold leading-snug text-content">寝る前のストレッチ 10分</p>
                <div className="mb-1"><StarRating rating={5} size="sm" /></div>
                <p className="text-[8px] leading-relaxed text-content-muted">YouTube見ながら毎晩やってます。肩こりも減って一石二鳥...</p>
              </div>
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

/* ════════════════════════════════════════════
   LP 本体
   ════════════════════════════════════════════ */
export function LandingPage() {
  const shouldReduceMotion = useReducedMotion();
  const animated = !shouldReduceMotion;

  // パララックス用
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.12], [1, 0.96]);

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
          <HeroCopy />

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
            <PhoneMockup />
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

      {/* ─── 5. はじまったばかり — 左テキスト+右に縦積みカード ─── */}
      <section className="relative z-10 overflow-hidden py-28">
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-1/2"
          style={{
            background: "radial-gradient(ellipse at 80% 40%, rgba(169,143,216,0.05) 0%, transparent 60%)",
          }}
        />
        <div className="relative mx-auto grid max-w-page items-start gap-12 px-5 md:grid-cols-5">
          {/* 左: 2カラム分のテキスト */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: animated ? 0.7 : 0.01, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-2 md:sticky md:top-32"
          >
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary/60">
              just started
            </p>
            <h2 className="mb-5 text-2xl font-bold leading-tight text-content md:text-3xl">
              .nemuri は、
              <br />
              始まったばかりです。
            </h2>
            <p className="max-w-xs text-sm leading-[1.9] text-content-secondary">
              まだレビューも、データも、ほとんどありません。
              でも、だからこそ——あなたの体験が、最初の一歩になります。
            </p>
            <div className="mt-6 flex items-center gap-3 text-xs text-content-muted">
              <span className="h-px w-8 bg-border" />
              日本では約2,400万人が睡眠に問題を抱えています
            </div>
          </motion.div>

          {/* 右: 3カラム分に2つのカードを縦積み（異なるサイズ） */}
          <div className="space-y-5 md:col-span-3">
            <motion.div
              initial={animated ? { opacity: 0, y: 40 } : { opacity: 1 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: animated ? 0.6 : 0.01, ease: [0.22, 1, 0.36, 1] }}
              className="flex gap-5 rounded-2xl border border-border/40 bg-surface-card p-6"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="mb-2 text-base font-bold text-content">あなたの体験を待っています</h3>
                <p className="text-sm leading-relaxed text-content-secondary/80">
                  薬、枕、生活習慣——何が効いたか、何がダメだったか。どんな小さな体験でも、同じ悩みを持つ誰かのヒントになります。
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={animated ? { opacity: 0, y: 40 } : { opacity: 1 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: animated ? 0.15 : 0, duration: animated ? 0.6 : 0.01, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-accent/10 bg-gradient-to-br from-accent/5 to-transparent p-6"
            >
              <p className="mb-3 text-sm font-medium text-accent">実績はこれから、一緒につくる</p>
              <p className="text-sm leading-relaxed text-content-secondary/80">
                ユーザー数やレビュー数を盛って見せることはしません。リアルな声がひとつずつ集まって、本当に頼れる場所になる。
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── 6. スポンサー募集 — 横スクロール+CTA ─── */}
      <section className="relative z-10 border-t border-border/20 py-24">
        <div className="mx-auto max-w-page px-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-8 md:flex md:items-end md:justify-between"
          >
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.3em] text-accent/70">
                sponsors
              </p>
              <h2 className="text-2xl font-bold text-content md:text-3xl">
                睡眠をよくする企業と、
                <br className="md:hidden" />
                一緒に届けたい。
              </h2>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-[1.8] text-content-muted md:mt-0 md:text-right">
              広告ではなく、ユーザーの体験と
              <br className="hidden md:block" />
              自然につながる形で。
            </p>
          </motion.div>

          {/* 横スクロールカード — 各カードは異なる高さ・アクセント */}
          <div className="scrollbar-none -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6">
            <motion.div
              initial={animated ? { opacity: 0, x: 40 } : { opacity: 1 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: animated ? 0.5 : 0.01 }}
              className="w-[280px] flex-shrink-0 snap-start rounded-2xl border border-border bg-surface-card p-5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M3 13h18v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6zM3 13c0-3 2-5 5-5h8c3 0 5 2 5 5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="mb-2 text-base font-bold text-content">寝具・マットレス</h3>
              <p className="text-sm leading-relaxed text-content-secondary/80">
                枕、マットレス、布団、ウェイトブランケット——実際に使った人のレビューと一緒に、製品を届けられます。
              </p>
            </motion.div>

            <motion.div
              initial={animated ? { opacity: 0, x: 40 } : { opacity: 1 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: animated ? 0.1 : 0, duration: animated ? 0.5 : 0.01 }}
              className="w-[280px] flex-shrink-0 snap-start self-end rounded-2xl border border-accent/20 bg-gradient-to-b from-accent/8 to-surface-card p-5"
            >
              <h3 className="mb-2 text-base font-bold text-accent">サプリ・ヘルスケア</h3>
              <p className="mb-4 text-sm leading-relaxed text-content-secondary/80">
                メラトニン、GABA、CBDオイル——睡眠サプリの実体験が集まる場所で、信頼とともに届けます。
              </p>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.3 24.3 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-1.43 4.294a2.25 2.25 0 01-2.13 1.556H8.56a2.25 2.25 0 01-2.13-1.556L5 14.5m14 0H5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </motion.div>

            <motion.div
              initial={animated ? { opacity: 0, x: 40 } : { opacity: 1 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: animated ? 0.2 : 0, duration: animated ? 0.5 : 0.01 }}
              className="w-[280px] flex-shrink-0 snap-start rounded-2xl border border-info/15 bg-surface-card p-5"
            >
              <div className="mb-3 inline-flex rounded-lg bg-info/10 px-2.5 py-1 text-xs font-medium text-info">
                Tech
              </div>
              <h3 className="mb-2 text-base font-bold text-content">睡眠テック・アプリ</h3>
              <p className="text-sm leading-relaxed text-content-secondary/80">
                睡眠トラッカー、ホワイトノイズ、瞑想アプリ——眠りを改善するテクノロジーを必要な人に届けます。
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6 flex items-center justify-end gap-4"
          >
            <span className="text-xs text-content-muted">スポンサーに興味がある企業さまへ</span>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl border border-border-light bg-surface-elevated/60 px-5 py-2.5 text-sm font-medium text-content transition-all hover:border-primary/30 hover:bg-surface-elevated"
            >
              お問い合わせ
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

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

          {/* CTAボタン群 */}
          <div className="flex flex-col items-center gap-4">
            <Link
              href="/signup"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary to-accent/80 px-12 py-5 text-lg font-bold text-white shadow-[0_8px_32px_rgba(169,143,216,0.3)] transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_16px_48px_rgba(169,143,216,0.45)]"
            >
              {/* 呼吸グロー */}
              {animated && (
                <motion.span
                  className="absolute inset-0 rounded-2xl"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(169,143,216,0.2), inset 0 0 20px rgba(255,255,255,0.05)",
                      "0 0 40px rgba(169,143,216,0.35), inset 0 0 30px rgba(255,255,255,0.1)",
                      "0 0 20px rgba(169,143,216,0.2), inset 0 0 20px rgba(255,255,255,0.05)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                無料で始める
                <motion.svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  aria-hidden="true"
                  animate={animated ? { x: [0, 4, 0] } : undefined}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </span>
              {/* シマー */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </Link>

            {/* ソーシャルログイン表示 */}
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-border/40" />
              <div className="flex items-center gap-2">
                {/* Google */}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated/60 ring-1 ring-border/30">
                  <svg className="h-3.5 w-3.5 text-content-muted" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </span>
                {/* X */}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated/60 ring-1 ring-border/30">
                  <svg className="h-3 w-3 text-content-muted" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </span>
                {/* Mail */}
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-elevated/60 ring-1 ring-border/30">
                  <svg className="h-3.5 w-3.5 text-content-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M22 7l-10 7L2 7" />
                  </svg>
                </span>
              </div>
              <span className="h-px w-8 bg-border/40" />
            </div>

            <p className="text-xs text-content-muted/80">
              30秒で完了 · クレジットカード不要
            </p>
          </div>
        </motion.div>
      </section>

      {/* フッター */}
      <footer className="relative z-10 border-t border-border/20 py-6">
        <nav className="mb-4 flex flex-wrap items-center justify-center gap-4 text-xs text-content-muted">
          <Link href="/legal/terms" className="hover:text-content">利用規約</Link>
          <Link href="/legal/privacy" className="hover:text-content">プライバシーポリシー</Link>
          <Link href="/legal/disclaimer" className="hover:text-content">医療免責事項</Link>
          <Link href="/contact" className="hover:text-content">お問い合わせ</Link>
        </nav>
        <p className="text-center text-xs text-content-muted">&copy; 2026 .nemuri</p>
      </footer>
    </div>
  );
}
