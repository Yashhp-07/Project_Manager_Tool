/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0F0F1A',
        slate: '#2A2A40',
        paper: '#F5F4F0',
        surface: '#FFFFFF',
        accent: '#6C5CE7',
        amber: '#F59E0B',
        mint: '#10B981',
        border: '#E2E0DC',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        'fade-slide-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        scan: 'scan 1.2s ease-in-out forwards',
        'fade-slide-in': 'fade-slide-in 0.4s ease-out forwards',
      },
    },
  },
  plugins: [],
}
