"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/features/AuthGuard";
import { ProfileForm, type ProfileFormData, EMPTY_FORM } from "@/components/features/ProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import type { Gender, SleepDisorderType } from "@/types";

/** プロフィール編集フォーム */
function EditForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [initialData, setInitialData] = useState<ProfileFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 既存プロフィール取得
  useEffect(() => {
    if (!user) return;

    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setInitialData(EMPTY_FORM);
        } else {
          setInitialData({
            nickname: (data.nickname as string) ?? "",
            height: data.height ? String(data.height) : "",
            weight: data.weight ? String(data.weight) : "",
            gender: (data.gender as Gender) ?? null,
            ageGroup: (data.age_group as string) ?? null,
            sleepDisorderTypes: (data.sleep_disorder_types as SleepDisorderType[]) ?? [],
            cause: (data.cause as string) ?? "",
          });
        }
        setLoading(false);
      });
  }, [user]);

  const handleSubmit = useCallback(
    async (data: ProfileFormData): Promise<boolean> => {
      if (!user) return false;
      setSubmitting(true);
      setSubmitError(null);

      try {
        const { error } = await supabase
          .from("profiles")
          .update({
            nickname: data.nickname,
            height: data.height ? Number(data.height) : null,
            weight: data.weight ? Number(data.weight) : null,
            gender: data.gender,
            age_group: data.ageGroup,
            sleep_disorder_types: data.sleepDisorderTypes,
            cause: data.cause || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (error) throw error;

        router.push(`/profile/${user.id}`);
        return true;
      } catch {
        setSubmitError("プロフィールの更新に失敗しました。もう一度お試しください");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [user, router],
  );

  // ローディング
  if (loading) {
    return (
      <main className="flex min-h-screen items-start justify-center bg-surface px-4 py-8">
        <div className="w-full max-w-sm space-y-4" aria-busy="true" aria-label="読み込み中">
          <div className="h-7 w-48 animate-pulse rounded bg-surface-elevated" />
          <div className="h-12 w-full animate-pulse rounded-lg bg-surface-card" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 animate-pulse rounded-lg bg-surface-card" />
            <div className="h-12 animate-pulse rounded-lg bg-surface-card" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-20 animate-pulse rounded-full bg-surface-card" />
            <div className="h-10 w-20 animate-pulse rounded-full bg-surface-card" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-start justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-sm">
        {/* ヘッダー */}
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center text-content-secondary hover:text-content"
            aria-label="前のページに戻る"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-content">プロフィール編集</h1>
          <div className="w-5" aria-hidden="true" />
        </div>

        {/* エラー */}
        {submitError && (
          <p className="mb-5 rounded-lg bg-error/10 px-3 py-2 text-sm text-error" role="alert">
            {submitError}
          </p>
        )}

        {/* フォーム */}
        {initialData && (
          <ProfileForm
            initialData={initialData}
            onSubmit={handleSubmit}
            submitLabel="保存する"
            submitting={submitting}
          />
        )}
      </div>
    </main>
  );
}

/** プロフィール編集ページ */
export default function ProfileEditPage() {
  return (
    <AuthGuard>
      <EditForm />
    </AuthGuard>
  );
}
