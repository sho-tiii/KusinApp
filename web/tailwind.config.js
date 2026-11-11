/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
      colors: {
        cream: {
          DEFAULT: "#f7f4ee",
          light: "#faf7f0",
        },
        ink: {
          DEFAULT: "#101828",
          muted: "#475467",
          subtle: "#98a2b3",
        },
        chili: {
          50: "#fef3f2",
          100: "#fee4e2",
          200: "#fecdca",
          500: "#d92d20",
          600: "#b42318",
        },
      },
      boxShadow: {
        card: "0 16px 40px -8px rgba(16, 24, 40, 0.12), 0 4px 14px -2px rgba(16, 24, 40, 0.06)",
        pop: "0 20px 28px -4px rgba(16, 24, 40, 0.12), 0 8px 10px -4px rgba(16, 24, 40, 0.06)",
        modal: "0 20px 48px -12px rgba(16, 24, 40, 0.18), 0 8px 16px -4px rgba(16, 24, 40, 0.08)",
        "amber-ring": "0 0 0 3px rgba(245, 158, 11, 0.28)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.96) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fadeIn 0.15s ease-out",
        "scale-in": "scaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
