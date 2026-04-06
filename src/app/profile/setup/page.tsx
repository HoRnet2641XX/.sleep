"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/features/AuthGuard";
import { ProfileForm, type ProfileFormData } from "@/components/features/ProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

/** プロフィール初期設定フォーム */
function SetupForm() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (data: ProfileFormData): Promise<boolean> => {
      if (!user) return false;
      setSubmitting(true);
      setSubmitError(null);

      try {
        const { error } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            nickname: data.nickname,
            height: data.height ? Number(data.height) : null,
            weight: data.weight ? Number(data.weight) : null,
            gender: data.gender,
            age_group: data.ageGroup,
            sleep_disorder_types: data.sleepDisorderTypes,
            cause: data.cause || null,
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;

        router.push("/onboarding");
        return true;
      } catch {
        setSubmitError("プロフィールの保存に失敗しました。もう一度お試しください");
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [user, router],
  );

  return (
    <main className="flex min-h-screen items-start justify-center bg-surface px-4 py-8">
      <div className="w-full max-w-sm">
        {/* 見出し */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-content">
            プロフィールを設定しましょう
          </h1>
          <p className="mt-2 text-sm text-content-secondary">
            あなたに近い体験を見つけやすくなります
          </p>
        </div>

        {/* エラー */}
        {submitError && (
          <p className="mb-5 rounded-lg bg-error/10 px-3 py-2 text-sm text-error" role="alert">
            {submitError}
          </p>
        )}

        {/* フォーム */}
        <ProfileForm
          onSubmit={handleSubmit}
          submitLabel="はじめる"
          submitting={submitting}
        />

        {/* スキップリンク */}
        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-content-muted hover:text-content-secondary hover:underline">
            あとで設定する
          </Link>
        </p>
      </div>
    </main>
  );
}

/** プロフィール初期設定ページ */
export default function ProfileSetupPage() {
  return (
    <AuthGuard>
      <SetupForm />
    </AuthGuard>
  );
}
