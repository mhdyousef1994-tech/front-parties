module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#c59d5f',
          50: '#fff7e6',
          100: '#ffefcc',
          200: '#ffe0a3',
          300: '#ffd07a',
          400: '#e9b868',
          500: '#c59d5f',
          600: '#a8834f',
          700: '#8a6a41',
          800: '#6d5333',
          900: '#503d26'
        },
        ink: '#1f2937',
        brown: {
          DEFAULT: '#3b2f2f',
          700: '#2e2424',
          800: '#251d1d',
          900: '#1b1515'
        }
      },
      fontFamily: {
        cairo: ['"Cairo"', 'system-ui', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif']
      },
      boxShadow: {
        elegant: '0 10px 30px rgba(197,157,95,0.15)'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 800ms ease-out both',
        'fade-up': 'fade-up 900ms ease-out both'
      }
    }
  },
  plugins: [],
}
