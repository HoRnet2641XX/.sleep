"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface FormErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return "メールアドレスを入力してください";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "正しいメールアドレスを入力してください";
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return "パスワードを入力してください";
  if (password.length < 6) return "パスワードは6文字以上で入力してください";
  return undefined;
}

/** Google SVG アイコン */
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

/** X (Twitter) SVG アイコン */
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/** スピナー */
function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn, signInWithOAuth } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);

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
    const {
      data: { user: loggedInUser },
    } = await supabase.auth.getUser();
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

  const handleOAuth = async (provider: "google" | "twitter") => {
    setOauthLoading(provider);
    await signInWithOAuth(provider);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* ロゴ */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <svg
            className="h-10 w-10"
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
          <p className="text-sm text-content-secondary">眠れない夜を、ひとりにしない</p>
        </div>

        {/* カード */}
        <div className="rounded-xl border border-border bg-surface-card p-6">
          <h1 className="mb-6 text-center text-xl font-bold text-content">ログイン</h1>

          {/* ───── ソーシャルログイン ───── */}
          <div className="mb-5 space-y-3">
            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => handleOAuth("google")}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === "google" ? (
                <Spinner />
              ) : (
                <GoogleIcon className="h-5 w-5" />
              )}
              Googleでログイン
            </button>

            <button
              type="button"
              className="btn btn-secondary w-full"
              onClick={() => handleOAuth("twitter")}
              disabled={oauthLoading !== null}
            >
              {oauthLoading === "twitter" ? (
                <Spinner />
              ) : (
                <XIcon className="h-4 w-4" />
              )}
              Xでログイン
            </button>
          </div>

          {/* ───── 区切り線 ───── */}
          <div className="mb-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-content-muted">または</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* ───── メールログインフォーム ───── */}
          <form onSubmit={handleSubmit} noValidate>
            {submitError && (
              <p className="mb-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error" role="alert">
                {submitError}
              </p>
            )}

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

            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner />
                  ログイン中...
                </span>
              ) : (
                "メールアドレスでログイン"
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
      </motion.div>
    </main>
  );
}
