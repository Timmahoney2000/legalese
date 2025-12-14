/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
    colors: {
      legal: {
        navy: '#0A1628',
        slate: '#1E293B',
        blue: '#1E40AF',
        gold: '#D4AF37',
        cream: '#F5F1EB',
        stone: '#78716C',
      }
    },
    fontFamily: {
      serif: ['Crimson Pro', 'Georgia', 'serif'],
      sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    animation: {
      'fade-in': 'fadeIn 0.5s ease-in-out',
      'slide-up': 'slideUp 0.6s ease-out',
    },
    keyFrames: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1'},
      },
      slideUp: {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
    },
  },
},
  plugins: [],
}