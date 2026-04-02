"use client";

import type { UsagePeriod } from "@/types";
import { PERIOD_LABELS } from "@/types";

const PERIODS: UsagePeriod[] = ["under_1_week", "1_month", "3_months", "6_months", "over_1_year"];

type Props = {
  value: UsagePeriod | "";
  onChange: (period: UsagePeriod) => void;
};

/** 使用期間セレクター */
export function PeriodSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="使用期間">
      {PERIODS.map((period) => {
        const selected = value === period;
        return (
          <button
            key={period}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(period)}
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-micro ${
              selected
                ? "border-primary bg-primary/20 text-primary-hover"
                : "border-border text-content-secondary hover:border-border-light"
            }`}
          >
            {PERIOD_LABELS[period]}
          </button>
        );
      })}
    </div>
  );
}
