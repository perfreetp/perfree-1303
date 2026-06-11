/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: "#FFF7F0",
          100: "#FFE8D6",
          200: "#FFD0AD",
          300: "#FFB378",
          400: "#FF9550",
          500: "#FF7A45",
          600: "#F05A28",
          700: "#CC441C",
          800: "#A33519",
          900: "#7A2816",
        },
        secondary: {
          50: "#F0F7F4",
          100: "#D4E9E0",
          200: "#A8D3C1",
          300: "#74B89C",
          400: "#4A9A7D",
          500: "#2D6A4F",
          600: "#245540",
          700: "#1D4434",
          800: "#173529",
          900: "#112820",
        },
        background: "#FFF8F0",
        surface: "#FFFFFF",
        border: "#E5E7EB",
      },
      fontFamily: {
        sans: ["Noto Sans SC", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        "card-hover": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-right": "slideRight 0.3s ease-out",
        "pulse-soft": "pulseSoft 2s infinite",
        "bounce-soft": "bounceSoft 0.5s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideRight: {
          "0%": { transform: "translateX(20px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        bounceSoft: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
