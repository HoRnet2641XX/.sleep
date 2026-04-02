"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  onSubmit: (body: string) => Promise<boolean>;
  submitting: boolean;
};

/** コメント入力欄 */
export function CommentInput({ onSubmit, submitting }: Props) {
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async () => {
    const trimmed = body.trim();
    if (!trimmed) return;

    const success = await onSubmit(trimmed);
    if (success) {
      setBody("");
      setFocused(false);
    }
  }, [body, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && body.trim()) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [body, handleSubmit],
  );

  // 未ログイン時
  if (!user) {
    return (
      <div className="rounded-lg border border-border bg-surface-card px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-elevated">
            <svg className="h-4 w-4 text-content-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm text-content-muted">コメントを残してみませんか？</p>
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:text-primary-hover hover:underline"
            >
              ログインしてコメントする
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canSubmit = body.trim().length > 0 && !submitting;

  return (
    <div className="rounded-lg border border-border bg-surface-card p-3 transition-colors duration-micro focus-within:border-primary/50">
      <div className="flex gap-3">
        {/* ユーザーアバター代替 */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
          {user.email?.[0]?.toUpperCase() ?? "U"}
        </div>

        <div className="min-w-0 flex-1">
          <label htmlFor="comment-input" className="sr-only">
            コメントを入力
          </label>
          <textarea
            ref={inputRef}
            id="comment-input"
            rows={focused || body ? 3 : 1}
            className="w-full resize-none bg-transparent text-sm text-content outline-none placeholder:text-content-muted"
            placeholder="コメントを書く..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => { if (!body) setFocused(false); }}
            disabled={submitting}
          />

          {/* アクションバー（フォーカス時に表示） */}
          <AnimatePresence>
            {(focused || body) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-end gap-2 pt-2"
              >
                <button
                  type="button"
                  onClick={() => { setBody(""); setFocused(false); inputRef.current?.blur(); }}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-content-muted transition-colors hover:bg-surface-elevated hover:text-content-secondary"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-colors duration-micro ${
                    canSubmit
                      ? "bg-primary text-white hover:bg-primary-hover"
                      : "bg-navy-600 text-content-muted"
                  }`}
                  aria-label="コメントを送信"
                >
                  {submitting ? "送信中..." : "コメントする"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
