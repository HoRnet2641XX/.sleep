"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";

/** Capacitor ネイティブ環境の初期化 + 古いSWの掃除 */
function useNativeSetup() {
  useEffect(() => {
    // 既存ユーザーのブラウザに残ったSWを強制解除 (PWA機能は現状無効)
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      if ("caches" in window) {
        caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
      }
    }

    (async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;

        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const { SplashScreen } = await import("@capacitor/splash-screen");

        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#0B1120" });
        await SplashScreen.hide();
      } catch {
        // Web環境ではCapacitorが利用不可 — 無視
      }
    })();
  }, []);
}

/** クライアント側プロバイダーをまとめるラッパー */
export function Providers({ children }: { children: React.ReactNode }) {
  useNativeSetup();

  return (
    <MotionConfig reducedMotion="user">
      <AuthProvider>{children}</AuthProvider>
    </MotionConfig>
  );
}
