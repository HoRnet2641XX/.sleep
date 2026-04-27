import { ImageResponse } from "next/og";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? ".nemuri";
  const subtitle =
    searchParams.get("subtitle") ?? "眠れない夜を、ひとりにしない";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #080E1C 0%, #15193a 60%, #2a1f4a 100%)",
          color: "#F5F2FF",
          fontFamily: "sans-serif",
        }}
      >
        {/* グロー */}
        <div
          style={{
            position: "absolute",
            top: -150,
            left: -150,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(169,143,216,0.35) 0%, transparent 70%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            right: -150,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,184,61,0.18) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* ロゴ */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(169,143,216,0.6), rgba(245,184,61,0.4))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
            }}
          >
            🌙
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#F5F2FF",
              display: "flex",
            }}
          >
            .nemuri
          </div>
        </div>

        {/* メインテキスト */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.2,
              letterSpacing: "-0.03em",
              color: "#F5F2FF",
              maxWidth: 900,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#C4CAD8",
              maxWidth: 900,
              display: "flex",
            }}
          >
            {subtitle}
          </div>
        </div>

        {/* フッター */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#8891A8",
            fontSize: 20,
          }}
        >
          <div style={{ display: "flex" }}>睡眠障害のレビューSNS</div>
          <div style={{ display: "flex" }}>nemuri.app</div>
        </div>
      </div>
    ),
    SIZE,
  );
}
