"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { CommentWithUser } from "@/types";
import { Avatar } from "@/components/ui/Avatar";

/** 相対時間を計算 */
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}日前`;
  const months = Math.floor(days / 30);
  return `${months}ヶ月前`;
}

type Props = {
  comments: CommentWithUser[];
  loading: boolean;
};

/** コメント一覧 */
export function CommentSection({ comments, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="コメント読み込み中">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-6 w-6 shrink-0 animate-pulse rounded-full bg-surface-elevated" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-surface-elevated" />
              <div className="h-3 w-full animate-pulse rounded bg-surface-elevated" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border px-4 py-6 text-center">
        <svg className="mx-auto mb-2 h-6 w-6 text-content-muted/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-sm text-content-muted">
          まだコメントはありません。最初にコメントしてみましょう。
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-4" aria-label="コメント一覧">
      {comments.map((comment, i) => (
        <motion.li
          key={comment.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="rounded-lg border border-border bg-surface-card px-4 py-3"
        >
          <div className="flex gap-3">
            <Link href={`/profile/${comment.userId}`} className="shrink-0">
              <Avatar name={comment.user.nickname} imageUrl={comment.user.avatarUrl} size="sm" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <Link
                  href={`/profile/${comment.userId}`}
                  className="text-sm font-medium text-content hover:underline"
                >
                  {comment.user.nickname}
                </Link>
                <time className="text-xs text-content-muted" dateTime={comment.createdAt}>
                  {timeAgo(comment.createdAt)}
                </time>
              </div>
              <p className="text-sm leading-relaxed text-content-secondary">
                {comment.body}
              </p>
            </div>
          </div>
        </motion.li>
      ))}
    </ul>
  );
}
