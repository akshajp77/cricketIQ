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
        border: "#1F2937",
        input: "#1F2937",
        ring: "#00D4AA",
        background: "#0A0F1E",
        foreground: "#F9FAFB",
        primary: {
          DEFAULT: "#00D4AA",
          foreground: "#0A0F1E",
        },
        secondary: {
          DEFAULT: "#F59E0B",
          foreground: "#0A0F1E",
        },
        destructive: {
          DEFAULT: "#EF4444",
          foreground: "#F9FAFB",
        },
        muted: {
          DEFAULT: "#111827",
          foreground: "#6B7280",
        },
        accent: {
          DEFAULT: "#00D4AA",
          foreground: "#0A0F1E",
        },
        popover: {
          DEFAULT: "#111827",
          foreground: "#F9FAFB",
        },
        card: {
          DEFAULT: "#111827",
          foreground: "#F9FAFB",
        },
        surface: "#111827",
        navy: "#0A0F1E",
        teal: "#00D4AA",
        amber: "#F59E0B",
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        mono: ["Geist Mono", ...fontFamily.mono],
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
