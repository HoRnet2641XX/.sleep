"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@/components/features/AuthGuard";
import { ProfileForm, type ProfileFormData, EMPTY_FORM } from "@/components/features/ProfileForm";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { sanitizeError } from "@/lib/sanitizeError";
import type { Gender, SleepDisorderType } from "@/types";

/** アカウント削除ゾーン */
function DangerZone() {
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    /* RPC経由で auth.users を削除 (cascade で profiles 等も連動) */
    const { error: rpcError } = await supabase.rpc("delete_my_account");
    if (rpcError) {
      setError(sanitizeError(rpcError).message);
      setDeleting(false);
      return;
    }
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <section className="mt-12 rounded-2xl border border-error/30 bg-error/5 p-5">
      <h2 className="mb-2 text-sm font-bold text-error">アカウントを削除</h2>
      <p className="mb-3 text-xs leading-relaxed text-content-secondary">
        アカウントとすべてのレビュー・ジャーナル・フォロー関係が削除されます。
        他のユーザーが投稿したコメントへの返信は匿名化されて残ることがあります。
        この操作は<strong>取り消せません</strong>。
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="rounded-lg border border-error/40 px-4 py-2 text-sm font-medium text-error transition-colors hover:bg-error/10"
        >
          アカウントを削除する
        </button>
      ) : (
        <div className="space-y-3">
          <label htmlFor="confirm-delete" className="block text-xs text-content-secondary">
            確認のため「<strong className="text-error">削除します</strong>」と入力してください
          </label>
          <input
            id="confirm-delete"
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="input w-full"
            placeholder="削除します"
            autoComplete="off"
          />
          {error && (
            <p className="rounded bg-error/10 px-2 py-1.5 text-xs text-error">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setConfirmText("");
                setError(null);
              }}
              className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium text-content-secondary hover:bg-surface-elevated"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={confirmText !== "削除します" || deleting}
              className="flex-1 rounded-lg bg-error px-4 py-2 text-sm font-bold text-white hover:bg-error/90 disabled:opacity-40"
            >
              {deleting ? "削除中..." : "完全に削除する"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

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
            avatarUrl: (data.avatar_url as string | null) ?? null,
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
            avatar_url: data.avatarUrl,
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
        {initialData && user && (
          <ProfileForm
            initialData={initialData}
            userId={user.id}
            onSubmit={handleSubmit}
            submitLabel="保存する"
            submitting={submitting}
          />
        )}

        {/* 危険な操作: アカウント削除 */}
        {user && <DangerZone />}
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
