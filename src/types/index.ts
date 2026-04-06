// ─── ユーザー ───
export type SleepDisorderType =
  | "insomnia" // 入眠困難
  | "middle_awakening" // 中途覚醒
  | "early_awakening" // 早朝覚醒
  | "other";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";

export type UserProfile = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
  height: number | null; // cm
  weight: number | null; // kg
  gender: Gender | null;
  ageGroup: string | null; // "20代", "30代" 等
  sleepDisorderTypes: SleepDisorderType[];
  cause: string | null; // きっかけ（自由記述）
  createdAt: string;
  updatedAt: string;
};

// ─── レビュー ───
export type ReviewCategory =
  | "medicine" // 薬
  | "mattress" // マットレス
  | "pillow" // 枕
  | "chair" // 椅子
  | "habit"; // 生活習慣

export type EffectLevel = "none" | "slight" | "clear" | "significant";

export type UsagePeriod =
  | "under_1_week"
  | "1_month"
  | "3_months"
  | "6_months"
  | "over_1_year";

/** 比較アイテム */
export type ComparisonItem = {
  name: string;
  price: number | null;
  rating: number; // 1-5
  note: string;
};

export type Review = {
  id: string;
  userId: string;
  category: ReviewCategory;
  productName: string;
  rating: number; // 1-5
  effectLevel: EffectLevel;
  usagePeriod: UsagePeriod;
  body: string;
  imageUrls: string[];
  referenceUrl: string | null;
  comparisonItems: ComparisonItem[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ReviewWithUser = Review & {
  user: UserProfile;
};

// ─── コメント ───
export type Comment = {
  id: string;
  reviewId: string;
  userId: string;
  body: string;
  createdAt: string;
};

export type CommentWithUser = Comment & {
  user: UserProfile;
};

// ─── いいね ───
export type Like = {
  id: string;
  reviewId: string;
  userId: string;
  createdAt: string;
};

// ─── ブックマーク ───
export type Bookmark = {
  id: string;
  reviewId: string;
  userId: string;
  createdAt: string;
};

// ─── フォロー ───
export type Follow = {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: string;
};

// ─── フォーム用 ───
export type ReviewFormData = {
  category: ReviewCategory | "";
  productName: string;
  rating: number;
  effectLevel: EffectLevel | "";
  usagePeriod: UsagePeriod | "";
  body: string;
  images: File[];
  imageUrls: string[];
  referenceUrl: string;
  comparisonItems: ComparisonItem[];
};

// ─── ラベルマッピング ───
export const CATEGORY_LABELS: Record<ReviewCategory, string> = {
  medicine: "薬",
  mattress: "マットレス",
  pillow: "枕",
  chair: "椅子",
  habit: "生活習慣",
};

export const CATEGORY_ICONS: Record<ReviewCategory, string> = {
  medicine: "💊",
  mattress: "🛏",
  pillow: "☁",
  chair: "🪑",
  habit: "🌿",
};

export const EFFECT_LABELS: Record<EffectLevel, string> = {
  none: "なし",
  slight: "少し",
  clear: "はっきり",
  significant: "とても",
};

export const PERIOD_LABELS: Record<UsagePeriod, string> = {
  under_1_week: "〜1週間",
  "1_month": "1ヶ月",
  "3_months": "3ヶ月",
  "6_months": "半年",
  over_1_year: "1年以上",
};

export const SLEEP_DISORDER_LABELS: Record<SleepDisorderType, string> = {
  insomnia: "入眠困難",
  middle_awakening: "中途覚醒",
  early_awakening: "早朝覚醒",
  other: "その他",
};

export const GENDER_LABELS: Record<Gender, string> = {
  male: "男性",
  female: "女性",
  other: "その他",
  prefer_not_to_say: "回答しない",
};
