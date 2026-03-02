import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        love: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        },
        warm: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          cream: "#fdf6e3",
        },
        lavender: {
          100: "#f3e8ff",
          200: "#e9d5ff",
          300: "#d8b4fe",
          400: "#c084fc",
        },
      },
      borderRadius: {
        cute: "1.25rem",
      },
      fontFamily: {
        cute: ['"Nunito"', "sans-serif"],
      },
      animation: {
        "heart-pulse": "heartPulse 1.5s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        wiggle: "wiggle 0.5s ease-in-out",
      },
      keyframes: {
        heartPulse: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-3deg)" },
          "75%": { transform: "rotate(3deg)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
