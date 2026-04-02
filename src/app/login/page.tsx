"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

/** バリデーションエラーの型 */
interface FormErrors {
  email?: string;
  password?: string;
}

/** メールアドレスの簡易バリデーション */
function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "メールアドレスを入力してください";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "正しいメールアドレスを入力してください";
  return undefined;
}

/** パスワードのバリデーション */
function validatePassword(password: string): string | undefined {
  if (!password) return "パスワードを入力してください";
  if (password.length < 6) return "パスワードは6文字以上で入力してください";
  return undefined;
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ログイン済みならホームへ
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [authLoading, user, router]);

  const handleBlur = useCallback(
    (field: "email" | "password") => {
      const error =
        field === "email" ? validateEmail(email) : validatePassword(password);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [email, password],
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError(null);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) return;

    setSubmitting(true);
    const { error } = await signIn(email, password);

    if (error) {
      setSubmitting(false);
      setSubmitError("メールアドレスまたはパスワードが正しくありません");
      return;
    }

    // profiles レコードがなければ自動作成
    const { data: { user: loggedInUser } } = await supabase.auth.getUser();
    if (loggedInUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", loggedInUser.id)
        .maybeSingle();

      if (!profile) {
        const defaultNickname = email.split("@")[0] || "ユーザー";
        await supabase.from("profiles").insert({
          id: loggedInUser.id,
          nickname: defaultNickname,
        });
      }
    }

    setSubmitting(false);
    router.push("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="mb-8 flex items-center justify-center gap-2">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#F5B83D"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
              fill="rgba(245,184,61,0.12)"
            />
          </svg>
          <span className="text-2xl font-bold tracking-tight text-content">.sleep</span>
        </div>

        {/* カード */}
        <div className="rounded-xl border border-border bg-surface-card p-6">
          <h1 className="mb-6 text-center text-xl font-bold text-content">ログイン</h1>

          <form onSubmit={handleSubmit} noValidate>
            {/* 送信エラー */}
            {submitError && (
              <p className="mb-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error" role="alert">
                {submitError}
              </p>
            )}

            {/* メールアドレス */}
            <div className="mb-4">
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-content">
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-error" role="alert">
                  {errors.email}
                </p>
              )}
            </div>

            {/* パスワード */}
            <div className="mb-6">
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-content">
                パスワード
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="input w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur("password")}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : undefined}
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-error" role="alert">
                  {errors.password}
                </p>
              )}
            </div>

            {/* 送信ボタン */}
            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  ログイン中...
                </span>
              ) : (
                "ログイン"
              )}
            </button>
          </form>
        </div>

        {/* サインアップリンク */}
        <p className="mt-6 text-center text-sm text-content-secondary">
          アカウントをお持ちでない方{" "}
          <Link href="/signup" className="font-medium text-primary hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </main>
  );
}
