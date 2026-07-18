import type { Config } from 'tailwindcss';

/**
 * Timchenko.pro design tokens.
 * Brand: NAVY #1F3864 / GOLD #BF9000, blueprint aesthetic.
 * All component colors go through CSS variables (see globals.css) so the
 * palette can be themed without touching component code.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        'border-strong': 'hsl(var(--border-strong))',
        input: 'hsl(var(--border-strong))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        navy: {
          DEFAULT: '#1F3864',
          deep: '#16294A',
        },
        gold: {
          DEFAULT: '#BF9000',
          bright: '#D9A400',
        },
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'price-pulse': {
          '0%': { transform: 'scale(1)' },
          '35%': { transform: 'scale(1.03)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'price-pulse': 'price-pulse 320ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
