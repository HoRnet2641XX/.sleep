"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * 軽量プラガブル Analytics 統合。
 * 環境変数で設定:
 *   NEXT_PUBLIC_GA_ID  - Google Analytics 4 (G-XXXXXXX)
 *   NEXT_PUBLIC_PLAUSIBLE_DOMAIN - Plausible Analytics ドメイン (任意)
 *
 * Vercel Analytics は @vercel/analytics 導入後に追加可。
 *   npm i @vercel/analytics
 *   <Analytics /> を root layout に追加
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  /* SPA ナビゲーション時の page_view 送信 */
  useEffect(() => {
    if (!gaId) return;
    const win = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof win.gtag === "function") {
      const params = searchParams?.toString();
      const url = pathname + (params ? `?${params}` : "");
      win.gtag("event", "page_view", { page_path: url });
    }
  }, [pathname, searchParams, gaId]);

  if (!gaId && !plausibleDomain) return null;

  return (
    <>
      {gaId && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { send_page_view: false });
              `,
            }}
          />
        </>
      )}
      {plausibleDomain && (
        <script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
        />
      )}
    </>
  );
}
