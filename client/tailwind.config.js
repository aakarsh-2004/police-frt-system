/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        blue: {
          900: '#1a237e',
          800: '#283593',
          700: '#303f9f',
        },
        amber: {
          400: '#ffca28',
          500: '#ffc107',
          600: '#ffb300',
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-blue-100',
    'bg-red-100',
    'bg-green-100',
    'bg-amber-100',
    'text-blue-600',
    'text-red-600',
    'text-green-600',
    'text-amber-600',
    'dark:bg-gray-800',
    'dark:bg-gray-900',
    'dark:text-white',
    'dark:text-gray-100',
    'dark:text-gray-300',
    'dark:text-gray-400',
    'dark:border-gray-700',
    'dark:hover:bg-gray-700',
    'dark:bg-blue-800',
    'dark:hover:bg-blue-700',
    'dark:bg-amber-600',
    'dark:hover:bg-amber-700',
  ],
};