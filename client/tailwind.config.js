/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          main: "#3b82f6",
          light: "#60a5fa",
          dark: "#2563eb",
        },
        secondary: {
          main: "#8b5cf6",
          light: "#a78bfa",
          dark: "#7c3aed",
        },
      },
      animation: {
        blob: "blob 12s infinite cubic-bezier(0.4, 0, 0.2, 1)",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.2)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.8)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
  important: true,
};
