"use client";

import { useEffect } from "react";

/**
 * 既存ユーザーのブラウザに登録された古いSWを解除する。
 * PWA機能は一時的に無効化（キャッシュ戦略起因の不具合のため）。
 */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    (async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        await reg.unregister();
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    })();
  }, []);

  return null;
}
