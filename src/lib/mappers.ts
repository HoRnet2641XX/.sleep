import type {
  CommentWithUser,
  ComparisonItem,
  EffectLevel,
  Gender,
  Review,
  ReviewCategory,
  ReviewWithUser,
  SleepDisorderType,
  UsagePeriod,
  UserProfile,
} from "@/types";

export type SupabaseRow = Record<string, unknown>;

function requireJoinedRow(value: unknown, label: string): SupabaseRow {
  const row = Array.isArray(value) ? value[0] : value;

  if (!row || typeof row !== "object") {
    throw new Error(`${label}が見つかりません`);
  }

  return row as SupabaseRow;
}

function getJoinedProfile(row: SupabaseRow): SupabaseRow {
  return requireJoinedRow(row.profiles, "プロフィール");
}

/** Supabase の profiles 行をフロントの UserProfile 型へ変換 */
export function mapProfileRow(row: SupabaseRow): UserProfile {
  return {
    id: row.id as string,
    nickname: row.nickname as string,
    avatarUrl: (row.avatar_url as string | null) ?? null,
    height: (row.height as number | null) ?? null,
    weight: (row.weight as number | null) ?? null,
    gender: (row.gender as Gender | null) ?? null,
    ageGroup: (row.age_group as string | null) ?? null,
    sleepDisorderTypes: (row.sleep_disorder_types as SleepDisorderType[] | null) ?? [],
    cause: (row.cause as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** Supabase の reviews 行をユーザー情報なしの Review 型へ変換 */
export function mapReviewBaseRow(row: SupabaseRow): Review {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    category: row.category as ReviewCategory,
    productName: row.product_name as string,
    rating: row.rating as number,
    effectLevel: row.effect_level as EffectLevel,
    usagePeriod: row.usage_period as UsagePeriod,
    body: row.body as string,
    imageUrls: (row.image_urls as string[] | null) ?? [],
    referenceUrl: (row.reference_url as string | null) ?? null,
    comparisonItems: (row.comparison_items as ComparisonItem[] | null) ?? [],
    likesCount: row.likes_count as number,
    commentsCount: row.comments_count as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/** Supabase の reviews + profiles 結合行を ReviewWithUser 型へ変換 */
export function mapReviewRow(
  row: SupabaseRow,
  profile: SupabaseRow = getJoinedProfile(row),
): ReviewWithUser {
  return {
    ...mapReviewBaseRow(row),
    user: mapProfileRow(profile),
  };
}

export function mapReviewRows(rows: unknown[] | null | undefined): ReviewWithUser[] {
  return (rows ?? []).map((row) => mapReviewRow(row as SupabaseRow));
}

/** Supabase の comments + profiles 結合行を CommentWithUser 型へ変換 */
export function mapCommentRow(
  row: SupabaseRow,
  profile: SupabaseRow = getJoinedProfile(row),
): CommentWithUser {
  return {
    id: row.id as string,
    reviewId: row.review_id as string,
    userId: row.user_id as string,
    body: row.body as string,
    createdAt: row.created_at as string,
    user: mapProfileRow(profile),
  };
}
