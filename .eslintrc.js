module.exports = {
  extends: ['eslint:recommended', 'prettier'],
  ignorePatterns: ['example/**/*.js', 'dist/'],
  env: {
    node: true,
    es6: true,
  },
  parser: 'babel-eslint',
  rules: {
    'no-useless-escape': 0,
  },
};
