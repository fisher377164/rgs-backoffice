import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f5f7ff",
          100: "#e9edff",
          200: "#cdd7ff",
          300: "#aabaff",
          400: "#7e95ff",
          500: "#5873ff",
          600: "#3d58e6",
          700: "#2f44b4",
          800: "#27398f",
          900: "#1f2e72",
        },
        surface: "#ffffff",
        border: "#e5e7eb",
        muted: "#6b7280",
        bg: "#f8fafc",
      },
      borderRadius: {
        xl: "0.75rem",
        '2xl': "1rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
