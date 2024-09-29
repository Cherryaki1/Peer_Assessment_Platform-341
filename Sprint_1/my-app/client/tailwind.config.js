module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: theme => ({
        'hero-pattern': "url('/src/images/hero-pattern.svg')",
        'footer-texture': "url('/src/images/footer-texture.svg')",
      })
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

