import type {
  ReviewWithUser,
  ReviewCategory,
  EffectLevel,
  UsagePeriod,
  SleepDisorderType,
  ComparisonItem,
} from "@/types";

/** Supabase の reviews + profiles 結合行 → ReviewWithUser への変換 */
export function mapReviewRow(row: Record<string, unknown>): ReviewWithUser {
  const profile = row.profiles as Record<string, unknown>;
  return {
    id: row.id as string,
    userId: row.user_id as string,
    category: row.category as ReviewCategory,
    productName: row.product_name as string,
    rating: row.rating as number,
    effectLevel: row.effect_level as EffectLevel,
    usagePeriod: row.usage_period as UsagePeriod,
    body: row.body as string,
    imageUrls: (row.image_urls as string[]) ?? [],
    referenceUrl: (row.reference_url as string) ?? null,
    comparisonItems: (row.comparison_items as ComparisonItem[]) ?? [],
    likesCount: row.likes_count as number,
    commentsCount: row.comments_count as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
    user: {
      id: profile.id as string,
      nickname: profile.nickname as string,
      avatarUrl: (profile.avatar_url as string) ?? null,
      height: (profile.height as number) ?? null,
      weight: (profile.weight as number) ?? null,
      gender:
        (profile.gender as ReviewWithUser["user"]["gender"]) ?? null,
      ageGroup: (profile.age_group as string) ?? null,
      sleepDisorderTypes:
        (profile.sleep_disorder_types as SleepDisorderType[]) ?? [],
      cause: (profile.cause as string) ?? null,
      createdAt: profile.created_at as string,
      updatedAt: profile.updated_at as string,
    },
  };
}
