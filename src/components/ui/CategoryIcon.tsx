import type { ReviewCategory } from "@/types";

type Props = {
  category: ReviewCategory | "all";
  className?: string;
};

/** カテゴリに対応する単色ラインアイコン(24px stroke 1.5) */
export function CategoryIcon({ category, className = "h-4 w-4" }: Props) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (category) {
    case "all":
      // 四方向に伸びる星(すべてを表す)
      return (
        <svg {...common}>
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        </svg>
      );
    case "medicine":
      // カプセル
      return (
        <svg {...common}>
          <rect x="3" y="9" width="18" height="6" rx="3" />
          <path d="M12 9v6" />
        </svg>
      );
    case "mattress":
      // ベッドのシルエット
      return (
        <svg {...common}>
          <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
          <path d="M3 14h18" />
          <path d="M3 18v2M21 18v2" />
          <path d="M7 11h3" />
        </svg>
      );
    case "pillow":
      // ふんわり雲形の枕
      return (
        <svg {...common}>
          <path d="M4 14c0-3 2-5 5-5h6c3 0 5 2 5 5 0 2-1.5 3-3 3H7c-1.5 0-3-1-3-3z" />
          <path d="M7 14c.5-.8 1.3-1.3 2.2-1.4" />
        </svg>
      );
    case "chair":
      // オフィスチェア
      return (
        <svg {...common}>
          <path d="M6 11V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v5" />
          <path d="M5 11h14" />
          <path d="M7 11l1 6M17 11l-1 6" />
          <path d="M9 17h6" />
          <path d="M12 17v4" />
        </svg>
      );
    case "habit":
      // 月+葉(生活習慣)
      return (
        <svg {...common}>
          <path d="M20 14.5A8 8 0 1 1 9.5 4a6 6 0 0 0 10.5 10.5z" />
          <path d="M8 16c1.5-1.5 3-2 4.5-2" />
        </svg>
      );
  }
}
