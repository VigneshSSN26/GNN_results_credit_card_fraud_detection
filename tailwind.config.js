// frontend/tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0D1117', // A deep, dark slate
        'brand-light-dark': '#161B22', // A slightly lighter slate for cards
        'brand-blue': '#2F81F7',
        'brand-cyan': '#39D3F7',
        'brand-border': '#30363D',
      }
    },
  },
  plugins: [],
}