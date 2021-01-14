module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['prettier', 'plugin:react/recommended'],
  parser: 'babel-eslint',
  plugins: ['prettier', 'react'],
  rules: {
    'prettier/prettier': 'error',
  },
}
