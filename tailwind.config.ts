import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "#1B212C",
        input: "#1B212C",
        ring: "#10B981",
        background: "#07090D",
        foreground: "#F9FAFB",
        primary: {
          DEFAULT: "#10B981",
          foreground: "#07090D",
        },
        secondary: {
          DEFAULT: "#F59E0B",
          foreground: "#07090D",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#F9FAFB",
        },
        muted: {
          DEFAULT: "#0C1015",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#10B981",
          foreground: "#07090D",
        },
        popover: {
          DEFAULT: "#0C1015",
          foreground: "#F9FAFB",
        },
        card: {
          DEFAULT: "#0C1015",
          foreground: "#F9FAFB",
        },
        surface: {
          DEFAULT: "#0C1015",
          2: "#11161D",
        },
        hairline: {
          DEFAULT: "#1B212C",
          subtle: "#161B24",
          strong: "#2A3240",
        },
        ink: {
          DEFAULT: "#F9FAFB",
          secondary: "#8A93A3",
          muted: "#6B7484",
          faint: "#5A6372",
        },
        navy: "#07090D",
        teal: "#10B981",
        amber: "#F59E0B",
        sky: "#38BDF8",
        violet: "#A78BFA",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
        mono: ["var(--font-geist-mono)", ...fontFamily.mono],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
