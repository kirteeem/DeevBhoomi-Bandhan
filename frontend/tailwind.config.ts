import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],

  theme: {
    extend: {
      colors: {
        bg: "#FCFBF8",
        cream: "#FFF8F0",

        maroon: {
          DEFAULT: "#7A1E3A",
          dark: "#5C1629",
        },

        forest: {
          DEFAULT: "#305943",
          dark: "#213E30",
        },

        gold: {
          DEFAULT: "#D4AF37",
          soft: "#E8CD7A",
        },

        ink: "#1B1B1B",
        muted: "#666666",
        line: "#EFE8DD",
      },

      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],

        heading: ["Cormorant Garamond", "serif"],

        hindi: ["Tiro Devanagari Hindi", "serif"],

        button: ["Plus Jakarta Sans", "sans-serif"],
      },

      borderRadius: {
        card: "22px",
      },
    },
  },

  plugins: [],
} satisfies Config;