import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { args: 'none', varsIgnorePattern: '^_', caughtErrors: 'none' }],
      '@typescript-eslint/no-empty-object-type': 'off',
      'no-undef': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**'],
  }
);
