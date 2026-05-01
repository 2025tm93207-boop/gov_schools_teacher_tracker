/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Noto Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        gov: {
          navy: '#1a237e',
          'navy-light': '#283593',
          'navy-dark': '#0d1547',
          saffron: '#FF6F00',
          'saffron-light': '#FF8F00',
          'saffron-dark': '#E65100',
          green: '#138808',
          'green-light': '#1B9E12',
          white: '#FFFFFF',
          cream: '#FFF8E1',
          'cream-dark': '#FFF3C4',
          gold: '#FFB300',
          red: '#b71c1c',
          'red-light': '#c62828',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      boxShadow: {
        'gov': '0 4px 20px rgba(26, 35, 126, 0.12)',
        'gov-lg': '0 8px 30px rgba(26, 35, 126, 0.18)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 6px 24px rgba(0, 0, 0, 0.14)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}