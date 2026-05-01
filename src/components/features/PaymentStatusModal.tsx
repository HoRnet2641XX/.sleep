"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type PaymentStatus = "verifying" | "success" | "error" | null;

type Props = {
  status: PaymentStatus;
  errorMessage?: string | null;
  onClose?: () => void;
};

/**
 * 決済状態を全画面モーダルで表示する。
 * - verifying: スピナー + 「お支払いを確認中」(閉じれない)
 * - success: 王冠 + 「プレミアムへようこそ」(自動で閉じる)
 * - error: ⚠ + リトライ案内
 */
export function PaymentStatusModal({ status, errorMessage, onClose }: Props) {
  /* verifying 中は body スクロール抑制 */
  useEffect(() => {
    if (status) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [status]);

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/85 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="payment-status-title"
        >
          <motion.div
            initial={{ y: 20, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 10, scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="mx-4 w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface-card shadow-2xl"
          >
            {status === "verifying" && (
              <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
                <div className="relative">
                  <motion.div
                    className="h-14 w-14 rounded-full border-2 border-primary/30 border-t-primary"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </div>
                <h2 id="payment-status-title" className="text-base font-bold text-content">
                  お支払いを確認しています
                </h2>
                <p className="text-sm leading-relaxed text-content-secondary">
                  数秒で完了します。
                  <br />
                  画面を閉じずにお待ちください。
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 14, stiffness: 220 }}
                  className="relative flex h-16 w-16 items-center justify-center"
                >
                  {/* 金色グロー */}
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{
                      background:
                        "radial-gradient(circle, rgba(245,184,61,0.4) 0%, transparent 70%)",
                    }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.9, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-xl">
                    <svg
                      className="h-9 w-9 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 3h14v2H5v-2z" />
                    </svg>
                  </div>
                </motion.div>

                <h2 id="payment-status-title" className="text-lg font-bold text-content">
                  プレミアムへようこそ
                </h2>
                <p className="text-sm leading-relaxed text-content-secondary">
                  お支払いが完了し、すべての機能が解放されました。
                  <br />
                  ありがとうございます。
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-2 w-full rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 transition-transform hover:scale-[1.02]"
                >
                  プレミアムを使い始める
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/15 text-error">
                  <svg
                    className="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 id="payment-status-title" className="text-base font-bold text-content">
                  確認に失敗しました
                </h2>
                <p className="text-sm leading-relaxed text-content-secondary">
                  {errorMessage ??
                    "決済の確認に時間がかかっています。数分後にこのページを再読み込みしてください。"}
                </p>
                <div className="flex w-full gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-content-secondary hover:bg-surface-elevated"
                  >
                    閉じる
                  </button>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover"
                  >
                    再読み込み
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
