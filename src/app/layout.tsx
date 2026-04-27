import type { Metadata, Viewport } from "next";
import { Zen_Kaku_Gothic_New } from "next/font/google";
import "@/styles/globals.css";
import { Suspense } from "react";
import { Providers } from "@/components/Providers";
import { Analytics } from "@/components/Analytics";

const zenKaku = Zen_Kaku_Gothic_New({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-zen",
  display: "swap",
});

export const metadata: Metadata = {
  title: ".nemuri — 眠れない夜を、ひとりにしない",
  description:
    "睡眠障害を抱える人同士が「自分に効いたもの」を共有し合うプラットフォーム。薬・寝具・生活習慣のリアルなレビューが集まる場所。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: ".nemuri",
  },
  openGraph: {
    title: ".nemuri — 眠れない夜を、ひとりにしない",
    description:
      "睡眠障害を抱える人同士が「自分に効いたもの」を共有し合うプラットフォーム。",
    type: "website",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: ".nemuri",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ".nemuri — 眠れない夜を、ひとりにしない",
    description:
      "睡眠障害を抱える人同士が「自分に効いたもの」を共有し合うプラットフォーム。",
    images: ["/api/og"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080E1C",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`dark ${zenKaku.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen bg-surface text-content antialiased env-safe-area">
        <Providers>{children}</Providers>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  );
}
