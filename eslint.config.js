// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Interface entièrement en français : les apostrophes dans le texte JSX
    // (l'établissement, aujourd'hui...) sont normales et ne doivent pas être échappées.
    rules: {
      'react/no-unescaped-entities': 'off',
    },
  },
]);
