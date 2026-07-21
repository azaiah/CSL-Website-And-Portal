import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        // CSL brand tokens
        navy: {
          DEFAULT: "#16365C",
          deep: "#0E2440",
        },
        gold: {
          DEFAULT: "#C19A3E",
          light: "#E4C97E",
        },
        ink: "#1A1F2B",
        surface: "#F4F6F9",
        success: "#1E8E5A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(14,36,64,0.04), 0 6px 20px -4px rgba(14,36,64,0.08)",
        "card-hover":
          "0 2px 4px rgba(14,36,64,0.06), 0 24px 48px -12px rgba(14,36,64,0.20)",
        gold: "0 8px 24px -8px rgba(193,154,62,0.55)",
        "gold-lg": "0 16px 40px -12px rgba(193,154,62,0.5)",
        "inner-top": "inset 0 1px 0 0 rgba(255,255,255,0.6)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-18px) translateX(10px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(16px) translateX(-12px)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "70%, 100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 9s ease-in-out infinite",
        "float-slow": "float-slow 12s ease-in-out infinite",
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #E4C97E 0%, #C19A3E 55%, #B0882E 100%)",
        "navy-gradient": "linear-gradient(150deg, #0E2440 0%, #16365C 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
