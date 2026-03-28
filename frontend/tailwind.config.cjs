const path = require('node:path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{ts,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        surface: '#111111',
        'surface-soft': '#181818',
        brand: {
          red: '#da291c',
          dark: '#96070b',
          glow: '#ff5a4f',
          gold: '#f6c453',
        },
      },
      boxShadow: {
        card: '0 24px 70px rgba(0, 0, 0, 0.45)',
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 0 30px rgba(218, 41, 28, 0.28)',
        'glow-strong':
          '0 0 0 1px rgba(246, 196, 83, 0.24), 0 0 48px rgba(218, 41, 28, 0.42)',
      },
      backgroundImage: {
        'hero-gradient':
          'linear-gradient(135deg, rgba(5,5,5,1) 0%, rgba(20,20,20,0.98) 38%, rgba(110,8,15,0.94) 100%)',
        'panel-gradient':
          'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
      },
    },
  },
  plugins: [],
};
