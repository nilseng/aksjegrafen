/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        muted: "#6c757d",
        primary: "#1498c6",
        secondary: "#bf9dfc",
        danger: "#dc3545",
        success: "#28a745",
        warning: "#ffc107",
      },
    },
  },
  plugins: [],
};
