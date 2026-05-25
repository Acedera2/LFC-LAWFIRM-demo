/** @type {import('tailwindcss').Config} */
export default {
  // Dark mode removed for demo; enforce light-only styles
  darkMode: false,
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"]
      },
      colors: {
        ink: {
          50: "#f6f7f8",
          100: "#e8ebef",
          500: "#4c5968",
          700: "#263341",
          900: "#101820",
          950: "#0a0f14"
        },
        brass: {
          100: "#fff3d1",
          300: "#e3bd5e",
          500: "#b9862d",
          700: "#7c5217"
        },
        jade: {
          100: "#d9f7ea",
          400: "#34c48f",
          600: "#12805c",
          800: "#07543f"
        },
        signal: {
          coral: "#e66f5c",
          blue: "#4278f5",
          violet: "#7b61ff"
        }
      },
      boxShadow: {
        soft: "0 20px 60px rgba(16, 24, 32, 0.12)",
        glass: "0 18px 48px rgba(8, 13, 20, 0.18)"
      },
      backgroundImage: {
        "hero-room": "linear-gradient(90deg, rgba(10,15,20,0.86), rgba(10,15,20,0.48), rgba(10,15,20,0.18)), url('/hero-legal-suite.svg')"
      }
    }
  },
  plugins: []
};
