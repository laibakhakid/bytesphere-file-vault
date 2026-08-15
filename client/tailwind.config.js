/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        palette: {
          cream: '#FFF4C6',
          'cream-light': '#FFF9E6',
          pink: '#F5C6EC',
          'pink-light': '#FCE7F6',
          lavender: '#C4B5FD',
          'lavender-light': '#EDE9FE',
          violet: '#7C3AED',
          'violet-dark': '#5B21B6',
          offwhite: '#FAF8F5',
          surface: '#FFFFFF',
          dark: '#1E1B4B',
          text: '#1F2937',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        serif: ['"Times New Roman"', 'Times', 'serif'],
        sans: ['"Times New Roman"', 'Times', 'serif'],
        mono: ['"Times New Roman"', 'Times', 'serif'],
      },
      boxShadow: {
        'soft-purple': '0 10px 25px -5px rgba(124, 58, 237, 0.15)',
        'soft-pink': '0 10px 25px -5px rgba(245, 198, 236, 0.3)',
        'soft-card': '0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
};
