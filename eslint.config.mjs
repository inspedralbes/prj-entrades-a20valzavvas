import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // Global ignores
  {
    ignores: [
      '**/dist/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/coverage/**',
      'src/backend/laravel-service/**',
      'openspec/**',
      '**/*.d.ts',
    ],
  },

  // TypeScript rules — all workspaces
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': tsPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      // Allow variables prefixed with _ to be unused (standard convention for intentional ignores)
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^_', argsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'prettier/prettier': 'error',
    },
  },

  // Relax rules for test/spec files — mocking often requires 'any' and Function types
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
    },
  },

  // Prettier: disable ESLint rules that conflict with Prettier formatting
  prettierConfig,
];
