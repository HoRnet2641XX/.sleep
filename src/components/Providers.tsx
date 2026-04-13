"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "@/hooks/useAuth";
import { Capacitor } from "@capacitor/core";

/** Capacitor ネイティブ環境の初期化 */
function useNativeSetup() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    (async () => {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      const { SplashScreen } = await import("@capacitor/splash-screen");

      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: "#0B1120" });
      await SplashScreen.hide();
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
