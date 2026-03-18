/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ak: {
          900: '#8B0000',
          800: '#A31010',
          700: '#B82020',
          600: '#CC3333',
          500: '#D94848',
          100: '#FDF2F2',
          50: '#FEF8F8',
        },
        sand: {
          50: '#FDFCFB',
          100: '#F9F6F2',
          200: '#F0EBE3',
          300: '#E3D9CA',
          400: '#C4B39A',
        },
        ink: {
          900: '#1A1512',
          800: '#2D2520',
          700: '#46382E',
          600: '#5F4C3D',
          500: '#7A6455',
          400: '#968172',
          300: '#B3A393',
          200: '#D1C7BB',
        }
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
