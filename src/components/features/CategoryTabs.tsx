"use client";

import type { ReviewCategory } from "@/types";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "@/types";

type CategoryTabsProps = {
  selected: ReviewCategory | "all";
  onChange: (category: ReviewCategory | "all") => void;
};

const categories: { id: ReviewCategory | "all"; label: string; icon: string }[] = [
  { id: "all", label: "すべて", icon: "✦" },
  ...Object.entries(CATEGORY_LABELS).map(([id, label]) => ({
    id: id as ReviewCategory,
    label,
    icon: CATEGORY_ICONS[id as ReviewCategory],
  })),
];

export function CategoryTabs({ selected, onChange }: CategoryTabsProps) {
  return (
    <nav
      className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      role="tablist"
      aria-label="カテゴリ"
    >
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          role="tab"
          aria-selected={selected === cat.id}
          onClick={() => onChange(cat.id)}
          className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-all duration-micro ${
            selected === cat.id
              ? "bg-primary/15 font-semibold text-primary-hover"
              : "text-content-muted hover:text-content-secondary"
          }`}
        >
          {cat.icon} {cat.label}
        </button>
      ))}
    </nav>
  );
}
