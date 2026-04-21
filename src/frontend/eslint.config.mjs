import rootConfig from '../../eslint.config.mjs';
import pluginVue from 'eslint-plugin-vue';
import tsParser from '@typescript-eslint/parser';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Inherit TypeScript + Prettier rules from root
  ...rootConfig,

  // Vue 3 rules (flat config — includes vue-eslint-parser setup for .vue files)
  ...pluginVue.configs['flat/recommended'],

  // Ensure TypeScript parser is used for .vue <script lang="ts"> blocks
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // Disable multi-word component name rule: Nuxt pages require single-word filenames,
  // and project uses Catalan single-word domain names (Seient, Entrades, etc.)
  {
    files: ['**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },

  // Disable Prettier: disable ESLint rules that conflict with Prettier formatting
  prettierConfig,
];
