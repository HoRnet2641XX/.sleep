type AvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const sizeMap = {
  sm: "h-6 w-6 text-[9px]",
  md: "h-8 w-8 text-xs",
  lg: "h-12 w-12 text-base",
};

// ニックネームからアバターの色を決定
const colorVariants = [
  "bg-lavender-400/20 text-lavender-400 border-lavender-400/20",
  "bg-amber-400/20 text-amber-400 border-amber-400/20",
  "bg-sage-400/20 text-sage-400 border-sage-400/20",
  "bg-rose-400/20 text-rose-400 border-rose-400/20",
];

function getColorVariant(name: string): string {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorVariants[hash % colorVariants.length];
}

function getInitials(name: string): string {
  return name.slice(0, 2);
}

export function Avatar({ name, imageUrl, size = "md" }: AvatarProps) {
  const sizeClass = sizeMap[size];

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${name}のアバター`}
        className={`${sizeClass} shrink-0 rounded-full border object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${getColorVariant(name)} flex shrink-0 items-center justify-center rounded-full border font-bold`}
      aria-label={`${name}のアバター`}
    >
      {getInitials(name)}
    </div>
  );
}
