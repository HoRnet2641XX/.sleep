"use client";

import type { ReviewCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

/** カテゴリごとのSVGアイコン */
const ICONS: Record<ReviewCategory, React.ReactNode> = {
  medicine: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 5.25h3m-3 3.75h3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  mattress: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="2" y="8" width="20" height="8" rx="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12h20" strokeLinecap="round" />
    </svg>
  ),
  pillow: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <ellipse cx="12" cy="12" rx="10" ry="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  chair: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 19v-3m12 3v-3M5 16h14a1 1 0 001-1v-3a3 3 0 00-3-3H7a3 3 0 00-3 3v3a1 1 0 001 1zM7 9V6a1 1 0 011-1h8a1 1 0 011 1v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  habit: (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 3c-1.2 0-2.4.6-3 1.7A3.6 3.6 0 004.6 9c-1 1.2-1.1 3 0 4.2.5.5.5 1.3 0 1.8-1 1.2-.8 3 .3 4 1 .8 2.4 1 3.5.4.5-.3 1-.3 1.5 0 1 .5 2.3.5 3.2-.2 1-1 1.7-2.3 1.3-3.3-.2-.5.1-1 .5-1.2.8-.3 1.4-1 1.4-1.8 0-1.3-.3-2.6-1-3.6-.4-.5-.2-1.2.3-1.5.8-.5 1.5-1.3 1.5-2.4 0-2.2-2-3.4-3.5-2.7A3.4 3.4 0 0012 3z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const CATEGORIES: ReviewCategory[] = ["medicine", "mattress", "pillow", "chair", "habit"];

type Props = {
  value: ReviewCategory | "";
  onChange: (category: ReviewCategory) => void;
};

/** カテゴリ選択ピルボタン */
export function CategorySelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="カテゴリ選択">
      {CATEGORIES.map((cat) => {
        const selected = value === cat;
        return (
          <button
            key={cat}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(cat)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-micro ${
              selected
                ? "border-primary bg-primary/20 text-primary-hover"
                : "border-border text-content-secondary hover:border-border-light"
            }`}
          >
            {ICONS[cat]}
            {CATEGORY_LABELS[cat]}
          </button>
        );
      })}
    </div>
  );
}
