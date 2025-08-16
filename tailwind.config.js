/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line scans all your React components
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#0D1117',
        'brand-light-dark': '#161B22',
        'brand-blue': '#2F81F7',
        'brand-cyan': '#39D3F7',
        'brand-border': '#30363D',
      }
    },
  },
  plugins: [],
}
