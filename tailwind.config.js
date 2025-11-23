/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Cairo', 'sans-serif'],
        quran: ['Amiri', 'serif'],
      },
      colors: {
        neon: 'var(--neon-color, #53ff4c)',
        dark: '#0d0d0d',
        card: '#141414',
        'card-hover': '#1a1a1a',
      },
      boxShadow: {
        'neon': '0 0 10px rgba(var(--neon-rgb), 0.3), 0 0 20px rgba(var(--neon-rgb), 0.1)',
        'neon-hover': '0 0 15px rgba(var(--neon-rgb), 0.5), 0 0 30px rgba(var(--neon-rgb), 0.2)',
      }
    }
  },
  plugins: [],
}