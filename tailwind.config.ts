import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        display: ['var(--font-syne)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      colors: {
        bg: '#0a0a0f',
        surface: '#13131a',
        surface2: '#1c1c26',
        surface3: '#242432',
        border: '#2a2a3a',
        border2: '#3a3a50',
        accent: '#f97316',
        accent2: '#fb923c',
        textPrimary: '#f1f0ee',
        textSecondary: '#9896a4',
        textTertiary: '#5a5870',
      },
    },
  },
  plugins: [],
}
export default config
