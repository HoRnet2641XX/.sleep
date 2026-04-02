type StarRatingProps = {
  rating: number;
  size?: "sm" | "md";
  interactive?: boolean;
  onChange?: (rating: number) => void;
};

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-5 w-5",
};

export function StarRating({
  rating,
  size = "sm",
  interactive = false,
  onChange,
}: StarRatingProps) {
  const starSize = sizeMap[size];

  return (
    <div className="flex gap-0.5" role={interactive ? "radiogroup" : "img"} aria-label={`評価: ${rating}点`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={`${interactive ? "cursor-pointer" : "cursor-default"} p-0`}
          aria-label={interactive ? `${star}点` : undefined}
        >
          <svg
            className={starSize}
            viewBox="0 0 24 24"
            fill={star <= rating ? "#FFD06A" : "#243352"}
            stroke={star <= rating ? "#FFD06A" : "#2E4068"}
            strokeWidth="1.5"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}
