"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

/** ローディング用スケルトン */
function Skeleton() {
  return (
    <div className="min-h-screen bg-surface p-4" aria-busy="true" aria-label="読み込み中">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-card" />
        <div className="h-4 w-full animate-pulse rounded bg-surface-card" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-card" />
        <div className="mt-6 h-48 w-full animate-pulse rounded-xl bg-surface-card" />
        <div className="h-48 w-full animate-pulse rounded-xl bg-surface-card" />
      </div>
    </div>
  );
}

/** 認証が必要なページをラップするガードコンポーネント */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) return <Skeleton />;
  if (!user) return null;

  return <>{children}</>;
}
