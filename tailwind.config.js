/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FBF5EC',
        ink: { DEFAULT: '#493A33', 2: '#7A655B', 3: '#B8A89E' },
        accent: { DEFAULT: '#E29A9A', soft: '#FBE4E4' },
        apricot: { DEFAULT: '#F5CA8E', soft: '#FCEAD0' },
        line: '#493A33',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        hard: '3px 3px 0 #493A33',
        'hard-sm': '2px 2px 0 #493A33',
        'hard-accent': '3px 3px 0 #E29A9A',
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
}
