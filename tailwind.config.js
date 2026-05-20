// ═══════════════════════════════════════════════════════════════
// tailwind.config.js
// ═══════════════════════════════════════════════════════════════
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      // ── Brand colors ────────────────────────────────────────
      colors: {
        brand: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24", // Primary amber — CTAs, accents
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        surface: {
          950: "#0a0a0a", // Page background
          900: "#111111", // Card backgrounds
          800: "#1a1a1a", // Input backgrounds
          700: "#242424", // Hover states
          600: "#2e2e2e", // Borders
        },
      },

      // ── Typography ───────────────────────────────────────────
      fontFamily: {
        // Add Google Fonts link to index.html for these
        display: ["'Bebas Neue'", "Impact", "sans-serif"],
        body: ["'DM Sans'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },

      // ── Spacing ──────────────────────────────────────────────
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },

      // ── Animations ───────────────────────────────────────────
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(32px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      // fill-mode "both": holds first keyframe during delay, last after end
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "slide-up": "slide-up 0.6s cubic-bezier(0.16,1,0.3,1) both",
        shimmer: "shimmer 1.5s infinite linear",
      },

      // ── Aspect ratios ────────────────────────────────────────
      aspectRatio: {
        "car": "16 / 10",
      },
    },
  },

  plugins: [],
};