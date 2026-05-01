/** @type {import('tailwindcss').config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          500: '#f57c00',
          600: '#e65100',
          700: '#bf360c',
        },
        india: {
          white: '#ffffff',
          green: '#138808',
          navy: '#0f172a',
        },
      },
      boxShadow: {
        soft: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}