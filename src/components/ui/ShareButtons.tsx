"use client";

import { useState, useCallback } from "react";

type Props = {
  title: string;
  text: string;
  url: string;
};

export function ShareButtons({ title, text, url }: Props) {
  const [copied, setCopied] = useState(false);

  const shareText = `${title}\n${text}`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, [url]);

  const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;

  return (
    <div className="flex items-center gap-2">
      {/* X (Twitter) */}
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated text-content-secondary transition-colors hover:bg-surface-elevated/80 hover:text-content"
        aria-label="Xで共有"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* LINE */}
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-elevated text-content-secondary transition-colors hover:bg-[#06C755]/10 hover:text-[#06C755]"
        aria-label="LINEで共有"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.95 1.95 5.55 4.87 7.03-.19.68-.68 2.52-.78 2.9-.13.5.18.49.38.36.16-.1 2.5-1.7 3.52-2.39.64.09 1.3.1 1.98.1 5.52 0 10-3.82 10-8.5C22 5.82 17.52 2 12 2z" />
        </svg>
      </a>

      {/* URLコピー */}
      <button
        type="button"
        onClick={handleCopy}
        className="flex h-9 items-center gap-1.5 rounded-lg bg-surface-elevated px-3 text-xs font-medium text-content-secondary transition-colors hover:bg-surface-elevated/80 hover:text-content"
        aria-label="URLをコピー"
      >
        {copied ? (
          <>
            <svg className="h-3.5 w-3.5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            コピー済み
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            リンク
          </>
        )}
      </button>
    </div>
  );
}
