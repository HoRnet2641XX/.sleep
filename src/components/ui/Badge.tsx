import type { ReviewCategory, EffectLevel } from "@/types";
import { CATEGORY_LABELS, EFFECT_LABELS } from "@/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

// ─── カテゴリバッジ ───
type CategoryBadgeProps = {
  category: ReviewCategory;
};

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span className="badge inline-flex items-center gap-1 bg-primary/10 text-primary">
      <CategoryIcon category={category} className="h-3 w-3" />
      {CATEGORY_LABELS[category]}
    </span>
  );
}

// ─── 効果バッジ ───
type EffectBadgeProps = {
  effect: EffectLevel;
};

const effectStyles: Record<EffectLevel, string> = {
  none: "bg-navy-600 text-content-muted",
  slight: "bg-lavender-500/20 text-lavender-300",
  clear: "bg-sage-500/20 text-sage-300",
  significant: "bg-amber-500/20 text-amber-300",
};

export function EffectBadge({ effect }: EffectBadgeProps) {
  return (
    <span className={`badge ${effectStyles[effect]}`}>
      効果: {EFFECT_LABELS[effect]}
    </span>
  );
}

// ─── 睡眠障害タイプバッジ ───
type SleepTypeBadgeProps = {
  label: string;
};

export function SleepTypeBadge({ label }: SleepTypeBadgeProps) {
  return (
    <span className="badge bg-rose-500/10 text-rose-300">
      {label}
    </span>
  );
}
