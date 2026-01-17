/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        secondary: '#818CF8',
        cta: '#F97316',
        dark: {
          DEFAULT: '#0A0A0F',
          darker: '#050508',
        },
        light: {
          DEFAULT: '#EEF2FF',
          dark: '#1E1B4B',
        },
      },
      fontFamily: {
        'code': ['Fira Code', 'monospace'],
        'sans': ['Fira Sans', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 5px rgba(79, 70, 229, 0.5)' },
          '100%': { textShadow: '0 0 20px rgba(79, 70, 229, 0.8)' },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
