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
      // supabase-js は detectSessionInUrl により URL の ?code= / #access_token を
      // 自動処理する。ここでは処理完了を待ってからセッションを読むだけにする。
      // 明示的な exchangeCodeForSession を呼ぶと二重実行になり、
      // 「PKCE code verifier not found」エラーを招くので呼ばない。

      // セッション確立を最大3秒まで待つ
      let session = null;
      for (let i = 0; i < 15; i++) {
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          session = data.session;
          break;
        }
        await new Promise((r) => setTimeout(r, 200));
      }

      if (!session) {
        setError("認証に失敗しました。もう一度お試しください。");
        return;
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
