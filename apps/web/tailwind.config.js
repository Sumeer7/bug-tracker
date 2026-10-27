/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0c0a12',
          soft: '#12101a',
          card: '#1a1626',
          raised: '#221e32',
        },
        pulse: {
          amber: '#ffb347',
          magenta: '#e040fb',
          mint: '#5eead4',
          coral: '#ff6b6b',
        },
        mist: {
          DEFAULT: '#9b92b3',
          dim: '#6b6380',
        },
      },
      fontFamily: {
        display: ['"DM Sans"', 'system-ui', 'sans-serif'],
        body: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(224, 64, 251, 0.35)',
        card: '0 4px 24px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
};
