"use client";

import { motion, useReducedMotion } from "framer-motion";

export type InsightData = {
  type: "trend" | "community" | "personal";
  title: string;
  description: string;
  icon: React.ReactNode;
};

type Props = {
  insight: InsightData;
};

export function SleepInsightCard({ insight }: Props) {
  const reduced = useReducedMotion();
  const accentColor =
    insight.type === "trend"
      ? "from-primary/10 to-lavender-500/5"
      : insight.type === "community"
        ? "from-amber-500/10 to-accent/5"
        : "from-sage-400/10 to-sage-500/5";

  return (
    <motion.div
      initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className={`mb-4 rounded-xl border border-border/50 bg-gradient-to-br ${accentColor} px-5 py-4`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-elevated/80 text-content-secondary">
          {insight.icon}
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-sm font-semibold text-content">
            {insight.title}
          </p>
          <p className="text-sm leading-relaxed text-content-secondary">
            {insight.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
