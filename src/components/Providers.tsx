"use client";

import { AuthProvider } from "@/hooks/useAuth";

/** クライアント側プロバイダーをまとめるラッパー */
export function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
