/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'panel-dark': '#111827',
        'panel-darker': '#0B0F19', 
        'neon-cyan': '#00FFAA', 
        'status-green': '#10B981',
        'alert-red': '#EF4444',
      }
    },
  },
  plugins: [],
}