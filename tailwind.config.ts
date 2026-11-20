import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        navy: {
          DEFAULT: "#0d214f",
          50: "#f0f5ff",
          100: "#e8eaf2",
          200: "#b9cbf3",
          300: "#8fa3cf",
          400: "#5c7bb5",
          500: "#3a5a95",
          600: "#1d356d",
          700: "#16295a",
          800: "#0d214f",
          900: "#091838",
        },
        violet: {
          DEFAULT: "#834dfb",
          light: "#ebe4ff",
          tint: "#f1ecfd",
          dark: "#5925d6",
        },
        gold: {
          DEFAULT: "#f0e100",
          dark: "#787000",
          light: "#fefce5",
          tint: "#fcf9d6",
        },
        mint: {
          DEFAULT: "#4de791",
          dark: "#1e7e46",
          light: "#ecfdf2",
          tint: "#e4faee",
        },
        alice: "#f3f0fd",
        "four-bros": {
          bg: "#F4F4F4",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        headline: ["Funnel Display", ...fontFamily.sans],
        sans: ["Funnel Sans", ...fontFamily.sans],
      },
      lineHeight: {
        relaxed: "1.6",
        loose: "1.8",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
