/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          bg: 'var(--brand-bg)',
          surface: 'var(--brand-surface)',
          border: 'var(--brand-border)',
          accent: 'var(--brand-accent)',
          danger: 'var(--brand-danger)',
          muted: 'var(--brand-text-muted)',
        },
      },
    },
  },
  plugins: [],
};