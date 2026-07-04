/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF3EA',
          card: '#FFFDF9',
          dim: '#F0E4D3',
        },
        plum: {
          50: '#F3EBF1',
          100: '#E4D2E0',
          300: '#B285A5',
          500: '#6B4A63',
          600: '#5C3B54',
          700: '#4A2F44',
        },
        amber: {
          400: '#E8A33D',
          500: '#D8A13A',
          600: '#B5811F',
        },
        sage: {
          400: '#8FAD8A',
          500: '#7A9B76',
          600: '#5F7D5C',
        },
        ink: {
          DEFAULT: '#3A3234',
          soft: '#5C4A3F',
          muted: '#8A7F72',
          faint: '#B7AA9C',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        xl2: '18px',
      },
    },
  },
  plugins: [],
}