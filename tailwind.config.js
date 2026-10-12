/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        capitecBlue: '#005ea6',
        capitecRed: '#e30613',
      }
    },
  },
  plugins: [],
}
