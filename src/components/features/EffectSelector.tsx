"use client";

import type { EffectLevel } from "@/types";
import { EFFECT_LABELS } from "@/types";

const LEVELS: EffectLevel[] = ["none", "slight", "clear", "significant"];

type Props = {
  value: EffectLevel | "";
  onChange: (level: EffectLevel) => void;
};

/** 効果の実感セレクター（4段階） */
export function EffectSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="効果の実感">
      {LEVELS.map((level) => {
        const selected = value === level;
        return (
          <button
            key={level}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(level)}
            className={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-micro ${
              selected
                ? "border-sage-400 bg-sage-500/20 text-sage-300"
                : "border-border text-content-secondary hover:border-border-light"
            }`}
          >
            {EFFECT_LABELS[level]}
          </button>
        );
      })}
    </div>
  );
}
