/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'brand-navy': '#0B2641',
        brand: {
          navy: '#0B2641',
          DEFAULT: '#0B6FDB',
          cyan: '#0BA6CC',
          soft: '#E3F0FF',
        },
        'brand-2': '#0BA6CC',
        'brand-soft': '#E3F0FF',
        'brand-teal': '#12C2A2',
        learn: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          soft: 'rgba(99, 102, 241, 0.12)',
        },
        surface: {
          DEFAULT: 'var(--surface, #FFFFFF)',
          '2': 'var(--surface-2, #F8FAFD)',
          light: '#FFFFFF',
          'light-2': '#F8FAFD',
          dark: '#0E1833',
          'dark-2': '#122042',
        },
        line: 'var(--line, #E6EAF3)',
        text: 'var(--text, #0E1730)',
        muted: 'var(--muted, #5B6787)',
        faint: 'var(--faint, #9AA6C6)',
        border: {
          light: '#E6EAF3',
          dark: '#1B2950',
        },
      },
      fontFamily: {
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        heading: ['Sora', 'Figtree', 'sans-serif'],
        display: ['Sora', 'sans-serif'],
        script: ['Caveat', 'cursive'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(14,23,48,.04),0 10px 30px -18px rgba(14,23,48,.20)',
        lg: '0 2px 4px rgba(14,23,48,.05),0 22px 44px -22px rgba(14,23,48,.32)',
      },
      borderRadius: {
        card: '18px',
        btn: '11px',
        dialog: '24px',
        lg: '18px',
        md: '10px',
        sm: '7px',
      },
    },
  },
  plugins: [],
};
