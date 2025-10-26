/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
    './electron/**/*.{js,mjs,cjs}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FFB400',
        accent: '#FF4C4C',
        dark: {
          DEFAULT: '#1E1E1E',
          2: '#2C2C2C'
        },
        neutral: {
          bg: '#F9F9F9',
          border: '#E0E0E0'
        }
      },
      fontFamily: {
        title: ["Poppins", 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial'],
        body: ["Inter", "Roboto", 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial']
      }
    }
  },
  plugins: []
}
