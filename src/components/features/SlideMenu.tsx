"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSignOut: () => void;
};

export function SlideMenu({ open, onClose, userId, onSignOut }: Props) {
  const navRef = useRef<HTMLElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // ESC キーで閉じる + フォーカストラップ
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && navRef.current) {
        const focusables = navRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // フォーカス保持 & 初回フォーカス & スクロール抑制
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement;
      setTimeout(() => {
        navRef.current
          ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
          ?.focus();
      }, 0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      previouslyFocused.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-surface/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.nav
            ref={navRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="fixed bottom-0 right-0 top-0 z-50 w-72 border-l border-border bg-surface-card"
            role="dialog"
            aria-modal="true"
            aria-label="ユーザーメニュー"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <span className="text-sm font-semibold text-content">
                  メニュー
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg p-2 text-content-muted hover:bg-surface-elevated hover:text-content"
                  aria-label="メニューを閉じる"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-4">
                <ul className="space-y-1">
                  <li>
                    <Link href={`/profile/${userId}`} onClick={onClose} className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 text-sm text-content-secondary transition-colors hover:bg-surface-elevated hover:text-content">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      マイページ
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile/edit" onClick={onClose} className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 text-sm text-content-secondary transition-colors hover:bg-surface-elevated hover:text-content">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      プロフィール編集
                    </Link>
                  </li>
                  <li>
                    <Link href="/post" onClick={onClose} className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 text-sm text-content-secondary transition-colors hover:bg-surface-elevated hover:text-content">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" /><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" /></svg>
                      レビューを書く
                    </Link>
                  </li>
                  <li>
                    <Link href="/ranking" onClick={onClose} className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 text-sm text-content-secondary transition-colors hover:bg-surface-elevated hover:text-content">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M8 21h8M12 17v4M6 13l-1.12-7.03A1 1 0 015.87 5h12.26a1 1 0 01.99.97L18 13M6 13h12M6 13l-2 4h16l-2-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ランキング
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" onClick={onClose} className="flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-3 text-sm text-content-secondary transition-colors hover:bg-surface-elevated hover:text-content">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M3 9h18M9 21V9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      睡眠ダッシュボード
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="border-t border-border px-3 py-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSignOut();
                  }}
                  className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-content-muted transition-colors hover:bg-surface-elevated hover:text-error"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" strokeLinecap="round" strokeLinejoin="round" /><polyline points="16 17 21 12 16 7" strokeLinecap="round" strokeLinejoin="round" /><line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  ログアウト
                </button>
              </div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
