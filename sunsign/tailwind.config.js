/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sun-core': 'var(--sun-core)',
        'sun-corona': 'var(--sun-corona)',
        'sun-warm': 'var(--sun-warm)',
        'sun-dusk': 'var(--sun-dusk)',
        'sun-void': 'var(--sun-void)',
        'sun-ray': 'var(--sun-ray)',
        'sun-surface': 'var(--sun-surface)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-arabic': 'var(--text-arabic)',
      },
      fontFamily: {
        brand: ['Cormorant Garamond', 'serif'],
        arabic: ['Amiri', 'serif'],
        ui: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
