import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: ".nemuri — 眠れない夜を、ひとりにしない",
  description:
    "睡眠障害を抱える人同士が「自分に効いたもの」を共有し合うプラットフォーム。薬・寝具・生活習慣のリアルなレビューが集まる場所。",
  openGraph: {
    title: ".nemuri — 眠れない夜を、ひとりにしない",
    description:
      "睡眠障害を抱える人同士が「自分に効いたもの」を共有し合うプラットフォーム。",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1120",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
      </head>
      <body className="min-h-screen bg-surface text-content antialiased env-safe-area">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
