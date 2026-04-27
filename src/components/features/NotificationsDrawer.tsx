"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useNotifications, type NotificationItem } from "@/hooks/useNotifications";

type Props = {
  open: boolean;
  onClose: () => void;
  userId: string | null;
};

const TYPE_LABEL: Record<NotificationItem["type"], string> = {
  like: "いいね",
  comment: "コメント",
  follow: "フォロー",
  match: "マッチ",
  system: "お知らせ",
};

function NotifIcon({ type }: { type: NotificationItem["type"] }) {
  const cls = "h-4 w-4";
  switch (type) {
    case "like":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      );
    case "comment":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "follow":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M19 8v6M22 11h-6" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 2v4M5 5l3 3M2 12h4M19 5l-3 3M22 12h-4M12 22a10 10 0 01-10-10" strokeLinecap="round" />
        </svg>
      );
  }
}

function getTargetHref(n: NotificationItem): string | null {
  if (n.type === "follow" && n.actorId) return `/profile/${n.actorId}`;
  if ((n.type === "like" || n.type === "comment") && n.targetId)
    return `/review/${n.targetId}`;
  return null;
}

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const sec = Math.floor((now - then) / 1000);
  if (sec < 60) return "たった今";
  if (sec < 3600) return `${Math.floor(sec / 60)}分前`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}時間前`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}日前`;
  return new Date(iso).toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}

function NotifBody({ n }: { n: NotificationItem }) {
  const actor = n.actorNickname ?? "誰か";
  switch (n.type) {
    case "like":
      return (
        <p className="text-sm text-content">
          <b>{actor}</b>さんがあなたのレビューにいいねしました
        </p>
      );
    case "comment":
      return (
        <p className="text-sm text-content">
          <b>{actor}</b>さんがあなたのレビューにコメントしました
        </p>
      );
    case "follow":
      return (
        <p className="text-sm text-content">
          <b>{actor}</b>さんがあなたをフォローしました
        </p>
      );
    case "match":
      return (
        <p className="text-sm text-content">
          似た悩みのユーザーが見つかりました
        </p>
      );
    default:
      return <p className="text-sm text-content">{n.body ?? "お知らせ"}</p>;
  }
}

export function NotificationsDrawer({ open, onClose, userId }: Props) {
  const reduced = useReducedMotion();
  const { items, loading, markAllRead } = useNotifications(userId ?? undefined);

  // 開いたら自動で既読化
  useEffect(() => {
    if (open && userId) markAllRead();
  }, [open, userId, markAllRead]);

  // ESC + body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-surface/70 backdrop-blur-sm"
            aria-hidden="true"
          />
          <motion.aside
            initial={reduced ? { opacity: 0 } : { x: "100%" }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 320 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-sm flex-col border-l border-border bg-surface-card"
            role="dialog"
            aria-modal="true"
            aria-label="通知"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-base font-bold text-content">通知</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-content-muted hover:bg-surface-elevated hover:text-content"
                aria-label="閉じる"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </header>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
                  <svg className="h-12 w-12 text-content-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm font-medium text-content">通知はまだありません</p>
                  <p className="text-xs text-content-muted">活動が始まるとここに表示されます</p>
                </div>
              ) : (
                <ul className="divide-y divide-border/40">
                  {items.map((n) => {
                    const href = getTargetHref(n);
                    const inner = (
                      <div className="flex items-start gap-3 px-5 py-3 transition-colors hover:bg-surface-elevated/50">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          n.readAt ? "bg-surface-elevated text-content-muted" : "bg-primary/15 text-primary"
                        }`}>
                          <NotifIcon type={n.type} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <NotifBody n={n} />
                          <p className="mt-0.5 text-xs text-content-muted">
                            {TYPE_LABEL[n.type]} · {formatRelative(n.createdAt)}
                          </p>
                        </div>
                        {!n.readAt && (
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-label="未読" />
                        )}
                      </div>
                    );
                    return (
                      <li key={n.id}>
                        {href ? (
                          <Link href={href} onClick={onClose} className="block">
                            {inner}
                          </Link>
                        ) : (
                          inner
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
