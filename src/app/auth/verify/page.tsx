"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function VerifyPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <motion.div
        className="w-full max-w-sm text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* メールアイコン */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-8 w-8 text-primary"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="M22 4L12 13L2 4" />
          </svg>
        </div>

        {/* ロゴ */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F5B83D"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              fill="rgba(245,184,61,0.12)"
            />
          </svg>
          <span className="text-xl font-bold tracking-tight text-content">.sleep</span>
        </div>

        {/* メッセージ */}
        <div className="rounded-xl border border-border bg-surface-card p-6">
          <h1 className="mb-3 text-xl font-bold text-content">
            メールを確認してください
          </h1>
          <p className="mb-4 text-sm leading-relaxed text-content-secondary">
            ご入力いただいたメールアドレスに確認リンクを送信しました。
            メール内のリンクをクリックして、登録を完了してください。
          </p>

          <div className="rounded-lg bg-surface/50 px-4 py-3">
            <p className="text-xs text-content-muted">
              メールが届かない場合は、迷惑メールフォルダもご確認ください。
            </p>
          </div>
        </div>

        {/* リンク */}
        <p className="mt-6 text-sm text-content-secondary">
          <Link href="/login" className="font-medium text-primary hover:underline">
            ログインページに戻る
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
