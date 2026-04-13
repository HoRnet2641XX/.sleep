import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ─── Primitive Colors ───
        navy: {
          900: "#0B1120",
          800: "#131D36",
          700: "#1A2744",
          600: "#243352",
          500: "#2E4068",
        },
        lavender: {
          100: "#F0ECFA",
          200: "#E0D8F4",
          300: "#C7B8E8",
          400: "#A98FD8",
          500: "#8B6CC0",
        },
        amber: {
          100: "#FFF8EB",
          200: "#FFEFC7",
          300: "#FFE29D",
          400: "#FFD06A",
          500: "#F5B83D",
        },
        sage: {
          100: "#F0F5F0",
          200: "#DCE8DC",
          300: "#B8D4B8",
          400: "#8FBB8F",
          500: "#6CA06C",
        },
        rose: {
          100: "#FFF0F3",
          200: "#FFD9E0",
          300: "#FFB3C1",
          400: "#FF8FA3",
          500: "#E05780",
        },

        // ─── Semantic Colors ───
        surface: {
          DEFAULT: "#0B1120",
          card: "#131D36",
          elevated: "#1A2744",
          input: "#0E1629",
        },
        primary: {
          DEFAULT: "#A98FD8",
          hover: "#C7B8E8",
          muted: "#8B6CC0",
        },
        accent: {
          DEFAULT: "#F5B83D",
          hover: "#FFD06A",
        },
        border: {
          DEFAULT: "#243352",
          light: "#2E4068",
        },
        content: {
          DEFAULT: "#F0ECFA",
          secondary: "#9CA3B8",
          muted: "#6B7280",
        },
        success: { DEFAULT: "#4ADE80", dark: "#16A34A" },
        warning: { DEFAULT: "#FACC15", dark: "#CA8A04" },
        error: { DEFAULT: "#F87171", dark: "#DC2626" },
        info: { DEFAULT: "#60A5FA", dark: "#2563EB" },
      },
      fontFamily: {
        sans: [
          "Hiragino Sans",
          "Hiragino Kaku Gothic ProN",
          "Noto Sans JP",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        xs: ["12px", { lineHeight: "1.45" }],
        sm: ["13px", { lineHeight: "1.4" }],
        base: ["16px", { lineHeight: "1.6" }],
        lg: ["18px", { lineHeight: "1.5" }],
        xl: ["20px", { lineHeight: "1.4" }],
        "2xl": ["24px", { lineHeight: "1.3" }],
        "3xl": ["30px", { lineHeight: "1.2" }],
        "4xl": ["36px", { lineHeight: "1.1" }],
        "5xl": ["48px", { lineHeight: "1.1" }],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
      },
      spacing: {
        // 8px基準スペーシング（CLAUDE.md準拠）
        "0.5": "2px",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "24px",
        "6": "32px",
        "7": "48px",
        "8": "64px",
        "9": "96px",
      },
      maxWidth: {
        content: "640px",
        page: "1280px",
      },
      transitionDuration: {
        micro: "150ms",
        normal: "200ms",
        slow: "300ms",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 300ms ease-out",
        "slide-up": "slide-up 300ms ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
