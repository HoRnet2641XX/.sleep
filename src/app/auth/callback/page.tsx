"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

/**
 * OAuth コールバック (クライアントサイド版)
 *
 * Supabase OAuth は PKCE フローで動作し、リダイレクト先で
 * URL フラグメント(#access_token=...)または ?code= を受け取る。
 * supabase-js はページ読み込み時に自動的にセッションを確立する。
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // supabase-js が URL のトークン/コードを自動検出してセッションを確立
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      if (!session) {
        // セッションが取得できない場合、少し待って再試行
        // (リダイレクト直後はハッシュの処理に時間がかかることがある)
        await new Promise((r) => setTimeout(r, 1000));
        const { data: retry } = await supabase.auth.getSession();
        if (!retry.session) {
          setError("認証に失敗しました。もう一度お試しください。");
          return;
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // profiles レコードがなければ自動作成
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (!profile) {
          const nickname =
            user.user_metadata?.full_name ??
            user.user_metadata?.name ??
            user.email?.split("@")[0] ??
            "ユーザー";
          await supabase.from("profiles").insert({
            id: user.id,
            nickname,
            avatar_url: user.user_metadata?.avatar_url ?? null,
          });
          router.replace("/profile/setup");
          return;
        }
      }

      router.replace("/");
    })();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-error">{error}</p>
        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="btn-primary text-sm"
        >
          ログインに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-content-secondary">認証中...</p>
      </div>
    </div>
  );
}
