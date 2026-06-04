import { supabase } from "@/lib/supabase";
import { mapCommentRow, mapReviewRow, type SupabaseRow } from "@/lib/mappers";
import type { CommentWithUser, ReviewWithUser } from "@/types";

const PUBLIC_PROFILE_SELECT =
  "user_id, nickname, avatar_url, height, weight, weight_is_public, gender, age_group, sleep_disorder_types, cause, created_at, updated_at";

function uniqueIds(ids: Array<string | null | undefined>): string[] {
  return Array.from(new Set(ids.filter(Boolean) as string[]));
}

export function fallbackPublicProfile(userId: string): SupabaseRow {
  const now = new Date(0).toISOString();
  return {
    user_id: userId,
    id: userId,
    nickname: "ユーザー",
    avatar_url: null,
    height: null,
    weight: null,
    weight_is_public: false,
    gender: null,
    age_group: null,
    sleep_disorder_types: [],
    cause: null,
    created_at: now,
    updated_at: now,
  };
}

export async function fetchPublicProfileMap(
  userIds: Array<string | null | undefined>,
): Promise<Record<string, SupabaseRow>> {
  const ids = uniqueIds(userIds);
  if (ids.length === 0) return {};

  const { data } = await supabase
    .from("public_profiles")
    .select(PUBLIC_PROFILE_SELECT)
    .in("user_id", ids);

  return Object.fromEntries(
    (data ?? []).map((row) => {
      const profile = row as SupabaseRow;
      const userId = profile.user_id as string;
      return [userId, { ...profile, id: userId }];
    }),
  );
}

export async function mapReviewRowsWithPublicProfiles(
  rows: unknown[] | null | undefined,
): Promise<ReviewWithUser[]> {
  const reviewRows = (rows ?? []) as SupabaseRow[];
  const profiles = await fetchPublicProfileMap(reviewRows.map((row) => row.user_id as string));

  return reviewRows.map((row) => {
    const userId = row.user_id as string;
    return mapReviewRow(row, profiles[userId] ?? fallbackPublicProfile(userId));
  });
}

export async function mapReviewRowWithPublicProfile(row: SupabaseRow): Promise<ReviewWithUser> {
  const userId = row.user_id as string;
  const profiles = await fetchPublicProfileMap([userId]);
  return mapReviewRow(row, profiles[userId] ?? fallbackPublicProfile(userId));
}

export async function mapCommentRowsWithPublicProfiles(
  rows: unknown[] | null | undefined,
): Promise<CommentWithUser[]> {
  const commentRows = (rows ?? []) as SupabaseRow[];
  const profiles = await fetchPublicProfileMap(commentRows.map((row) => row.user_id as string));

  return commentRows.map((row) => {
    const userId = row.user_id as string;
    return mapCommentRow(row, profiles[userId] ?? fallbackPublicProfile(userId));
  });
}
