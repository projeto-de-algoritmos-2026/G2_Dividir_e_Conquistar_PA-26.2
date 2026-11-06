/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        retro: ['"VT323"', 'monospace'],
      },
      colors: {
        arcade: {
          bg: '#0f0f1b',
          panel: '#1a1a2e',
          border: '#39395f',
          accent: '#e94560',
          gold: '#f9ca24',
          cyan: '#00d2d3',
          green: '#2ed573',
          purple: '#9b59b6',
        }
      },
      boxShadow: {
        'pixel': '4px 4px 0px 0px rgba(0, 0, 0, 0.75)',
        'pixel-sm': '2px 2px 0px 0px rgba(0, 0, 0, 0.75)',
        'pixel-lg': '6px 6px 0px 0px rgba(0, 0, 0, 0.75)',
        'pixel-glow-cyan': '0 0 10px #00d2d3, 4px 4px 0px 0px rgba(0, 0, 0, 0.75)',
        'pixel-glow-gold': '0 0 10px #f9ca24, 4px 4px 0px 0px rgba(0, 0, 0, 0.75)',
      }
    },
  },
  plugins: [],
}
