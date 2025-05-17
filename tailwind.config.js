/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'blue-police': '#0659a4',
        'blueHover-police': '#3078b8',
        
      },
    },
  },
  plugins: [],
}

