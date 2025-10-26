module.exports = {
  plugins: {
    // Tailwind moved its PostCSS plugin to a separate package
    // we use @tailwindcss/postcss here so Vite/PostCSS can process @tailwind rules
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
