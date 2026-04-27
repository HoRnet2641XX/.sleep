"use client";

import { useEffect } from "react";

/**
 * Root layout 自体がクラッシュした場合のフォールバック。
 * Providers 内で例外が発生しても画面を出せるようにする。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[app/global-error.tsx]", error);
    }
  }, [error]);

  return (
    <html lang="ja">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          background: "#080E1C",
          color: "#EAE9F4",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 20,
          padding: 20,
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
          予期せぬエラーが発生しました
        </h1>
        <p style={{ fontSize: 13, color: "#9A9BBA", margin: 0 }}>
          時間をおいてもう一度お試しください。
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={reset}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              background: "#A98FD8",
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            再読み込み
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              padding: "10px 20px",
              borderRadius: 12,
              background: "transparent",
              color: "#EAE9F4",
              border: "1px solid #2A2B3D",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ホームに戻る
          </button>
        </div>
      </body>
    </html>
  );
}
