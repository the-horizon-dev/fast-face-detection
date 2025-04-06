/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3f51b5',
          dark: '#303f9f',
        },
        secondary: {
          DEFAULT: '#f44336',
          dark: '#d32f2f',
        },
        success: '#4caf50',
        warning: '#ff9800',
        background: '#f5f5f5',
      },
      fontFamily: {
        sans: ['"Segoe UI"', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
}; 