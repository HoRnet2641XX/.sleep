"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/features/AuthGuard";

const steps = [
  {
    label: "プロフィールを設定",
    desc: "睡眠の悩みや体格を登録すると、より的確なおすすめが届きます",
    done: true,
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    ),
  },
  {
    label: "最初のレビューを書く",
    desc: "睡眠改善に効いたもの、試したものを共有しましょう",
    done: false,
    href: "/post",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="18" x2="12" y2="12" />
        <line x1="9" y1="15" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    label: "気になる人をフォロー",
    desc: "他のユーザーのレビューをチェックして、フォローしましょう",
    done: false,
    href: "/",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
];

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

function OnboardingContent() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <motion.div
        className="w-full max-w-sm"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        <motion.div variants={fadeInUp} className="mb-8 text-center">
          <img src="/mascot.svg" alt=".nemuri" className="mx-auto mb-4 h-16 w-16" />
          <h1 className="mb-2 text-2xl font-bold text-content">ようこそ .nemuri へ</h1>
          <p className="text-sm text-content-secondary">
            3つのステップで、あなたの体験を共有しましょう
          </p>
        </motion.div>

        <div className="space-y-4">
          {steps.map((step, i) => (
            <motion.div key={step.label} variants={fadeInUp}>
              <div
                className={`rounded-xl border p-5 transition-colors ${
                  step.done
                    ? "border-success/30 bg-success/5"
                    : i === 1
                      ? "border-primary/30 bg-primary/5"
                      : "border-border bg-surface-card"
                }`}
              >
                <div className="mb-2 flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                      step.done
                        ? "bg-success/20 text-success"
                        : i === 1
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-elevated text-content-muted"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <h3 className={`text-sm font-bold ${step.done ? "text-success" : "text-content"}`}>
                    {step.label}
                  </h3>
                </div>
                <p className="mb-3 pl-11 text-xs leading-relaxed text-content-secondary">
                  {step.desc}
                </p>
                {!step.done && step.href && i === 1 && (
                  <div className="pl-11">
                    <Link href={step.href} className="btn btn-primary text-sm">
                      レビューを書く
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={fadeInUp} className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-content-muted hover:text-primary"
          >
            あとで — ホームへ
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <AuthGuard>
      <OnboardingContent />
    </AuthGuard>
  );
}
