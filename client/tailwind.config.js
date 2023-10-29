/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        muted: "#6c757d",
        primary: "#17a2b8",
        secondary: "#bf9dfc",
        danger: "#dc3545",
        success: "#28a745",
        warning: "#ffc107",
      },
    },
  },
  plugins: [],
};
