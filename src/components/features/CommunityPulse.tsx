"use client";

type Props = {
  count: number | null;
};

export function CommunityPulse({ count }: Props) {
  if (count === null) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-border/40 bg-surface-card/50 px-4 py-3">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
      </span>
      <p className="text-sm text-content-secondary">
        今夜{" "}
        <span className="font-semibold text-content">{count}人</span>{" "}
        がレビューを読んでいます
      </p>
    </div>
  );
}
