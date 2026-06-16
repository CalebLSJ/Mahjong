import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        felt: { DEFAULT: '#1a472a', light: '#1f5233', dark: '#15391f' },
        tile: { DEFAULT: '#f5e6c8', border: '#8b6914' },
        gold: '#ffd700',
        bamboo: '#2e7d32',
        circles: '#1565c0',
        chars: '#c62828',
      },
    },
  },
} satisfies Config;
