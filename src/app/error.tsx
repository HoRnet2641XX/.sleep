"use client";

import { useEffect } from "react";

/**
 * App Router のページレベル エラーバウンダリ。
 * 画面遷移中のランタイムエラーで白画面になるのを防ぐ。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 開発中は内容確認のためコンソール出力
    if (process.env.NODE_ENV !== "production") {
      console.error("[app/error.tsx]", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-surface px-5 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-error/10 text-error">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" strokeLinecap="round" />
          <line x1="12" y1="16" x2="12.01" y2="16" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <h1 className="mb-2 text-lg font-bold text-content">
          読み込みに失敗しました
        </h1>
        <p className="text-sm text-content-muted">
          時間をおいてもう一度お試しください。
        </p>
        {process.env.NODE_ENV !== "production" && (
          <pre className="mt-4 max-w-md overflow-auto rounded-lg border border-border bg-surface-card px-3 py-2 text-left text-[10px] text-content-secondary">
            {error.message}
            {error.stack && "\n" + error.stack.split("\n").slice(0, 5).join("\n")}
          </pre>
        )}
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-hover"
        >
          再読み込み
        </button>
        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
          className="rounded-xl border border-border-light bg-surface-elevated px-5 py-2.5 text-sm font-medium text-content hover:bg-surface-card"
        >
          ホームに戻る
        </button>
      </div>
    </div>
  );
}
