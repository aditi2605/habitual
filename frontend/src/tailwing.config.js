cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0c0b',
        surface: '#121512',
        border: '#242824',
        green: {
          DEFAULT: '#6db85c',
          light: '#9dd48e',
        },
        amber: '#e8c46a',
        coral: '#e8796a',
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
EOF