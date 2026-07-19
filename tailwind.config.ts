import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#16A34A", // Green accent
          light: "#22C55E",
          dark: "#15803D",
        },
        navy: {
          DEFAULT: "#0F172A", // Dark navy/charcoal
          light: "#1E293B",
          dark: "#020617",
        },
        teal: {
          DEFAULT: "#0D9488",
          light: "#14B8A6",
          dark: "#0F766E",
        },
      },
      animation: {
        "radar-pulse": "radar-pulse 4s cubic-bezier(0, 0, 0.2, 1) infinite",
        "radar-sweep": "radar-sweep 8s linear infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        "float-delayed": "float-slow 6s ease-in-out infinite 3s",
      },
      keyframes: {
        "radar-pulse": {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.5)", opacity: "0" },
        },
        "radar-sweep": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
