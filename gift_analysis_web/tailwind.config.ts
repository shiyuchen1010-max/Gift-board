import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        panel: '#121A2B',
        card: '#1B2640',
        ink: '#F8FAFC',
        muted: '#94A3B8',
        brand: '#6D5EF7',
        cyan: '#22C7F0',
        mint: '#34D399',
      },
      boxShadow: {
        glow: '0 18px 60px rgba(34, 199, 240, 0.18)',
        glass: '0 10px 40px rgba(15, 23, 42, 0.35)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top left, rgba(109,94,247,0.35), transparent 30%), radial-gradient(circle at top right, rgba(34,199,240,0.25), transparent 28%), linear-gradient(180deg, #0B1020 0%, #121A2B 55%, #1B2640 100%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
