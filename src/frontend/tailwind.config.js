/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#f7f8f5",
          raised: "#ffffff",
          muted: "#edf2ee"
        },
        ink: {
          DEFAULT: "#18211d",
          muted: "#5f6f67",
          subtle: "#7a8780"
        },
        accent: {
          DEFAULT: "#28745c",
          strong: "#1f5c49",
          soft: "#dcece5"
        },
        caution: {
          DEFAULT: "#9f5d15",
          soft: "#fff3df"
        }
      },
      boxShadow: {
        page: "0 18px 45px rgba(24, 33, 29, 0.12)",
        soft: "0 12px 28px rgba(24, 33, 29, 0.08)"
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
