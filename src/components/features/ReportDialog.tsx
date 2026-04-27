"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

type Props = {
  open: boolean;
  onClose: () => void;
  targetType: "review" | "comment" | "user";
  targetId: string;
};

const REASONS = [
  "スパム・宣伝",
  "誤情報・医療上問題のある内容",
  "誹謗中傷・嫌がらせ",
  "個人情報の暴露",
  "成人向け・暴力的な内容",
  "その他",
];

export function ReportDialog({ open, onClose, targetType, targetId }: Props) {
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    const text = `${reason}${detail ? `\n${detail}` : ""}`.trim();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("ログインが必要です");
      setSubmitting(false);
      return;
    }
    const { error: err } = await supabase.from("reports").insert({
      reporter_id: user.id,
      target_type: targetType,
      target_id: targetId,
      reason: text,
    });
    if (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }
    setDone(true);
    setSubmitting(false);
    setTimeout(() => {
      onClose();
      setDone(false);
      setDetail("");
      setReason(REASONS[0]);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-surface/80 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 z-50 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-card p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="通報"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-content">通報</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-1 text-content-muted hover:text-content"
                aria-label="閉じる"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {done ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/15 text-success">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-content">通報を受け付けました</p>
                <p className="text-xs text-content-muted">48時間以内に確認します</p>
              </div>
            ) : (
              <>
                <p className="mb-3 text-xs text-content-secondary">
                  通報内容は運営チームのみが確認します。報告者の情報は対象ユーザーには共有されません。
                </p>

                <fieldset className="mb-4">
                  <legend className="mb-2 text-xs font-medium text-content-muted">理由を選んでください</legend>
                  <div className="space-y-1.5">
                    {REASONS.map((r) => (
                      <label key={r} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/40 px-3 py-2 text-sm text-content-secondary hover:border-primary/30 hover:bg-surface-elevated">
                        <input
                          type="radio"
                          name="reason"
                          value={r}
                          checked={reason === r}
                          onChange={() => setReason(r)}
                          className="accent-primary"
                        />
                        {r}
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div className="mb-4">
                  <label htmlFor="report-detail" className="mb-1.5 block text-xs font-medium text-content-muted">
                    詳細（任意）
                  </label>
                  <textarea
                    id="report-detail"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="補足情報があればご記入ください"
                    className="input w-full resize-none text-sm"
                  />
                </div>

                {error && (
                  <p className="mb-3 rounded-lg bg-error/10 px-3 py-2 text-xs text-error" role="alert">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-content-secondary hover:bg-surface-elevated"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-error px-4 py-2 text-sm font-bold text-white hover:bg-error/90 disabled:opacity-40"
                  >
                    {submitting ? "送信中..." : "通報する"}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
