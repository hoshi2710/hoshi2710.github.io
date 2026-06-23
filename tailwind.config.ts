import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './posts/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nebula: {
          50: '#f5f3ff',
          100: '#ede9fe',
          300: '#c4b5fd',
          500: '#8b5cf6',
          700: '#6d28d9',
          950: '#1e1238',
        },
        cosmic: '#070712',
        starlight: '#f8fafc',
      },
      boxShadow: {
        glow: '0 0 40px rgba(139, 92, 246, 0.35)',
        card: '0 24px 80px rgba(0, 0, 0, 0.35)',
      },
      backgroundImage: {
        'cosmic-radial': 'radial-gradient(circle at top left, rgba(139, 92, 246, 0.28), transparent 32%), radial-gradient(circle at 80% 20%, rgba(14, 165, 233, 0.2), transparent 28%), linear-gradient(135deg, #070712 0%, #111827 45%, #1e1238 100%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.18)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 5s linear infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
