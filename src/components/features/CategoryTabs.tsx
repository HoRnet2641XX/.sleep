"use client";

import type { ReviewCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

type CategoryTabsProps = {
  selected: ReviewCategory | "all";
  onChange: (category: ReviewCategory | "all") => void;
};

const categories: { id: ReviewCategory | "all"; label: string }[] = [
  { id: "all", label: "すべて" },
  ...Object.entries(CATEGORY_LABELS).map(([id, label]) => ({
    id: id as ReviewCategory,
    label,
  })),
];

export function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
  return (
    <div
      className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      role="group"
      aria-label="カテゴリフィルタ"
    >
      {categories.map((cat) => {
        const active = selected === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(cat.id)}
            className={`inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-all duration-micro ${
              active
                ? "bg-primary/15 font-semibold text-primary-hover"
                : "text-content-muted hover:text-content-secondary"
            }`}
          >
            <CategoryIcon category={cat.id} className="h-3.5 w-3.5" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
