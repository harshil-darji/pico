// @ts-check
import ts from '@typescript-eslint/utils/ts-eslint';

export default ts.config(
  {
    ignores: ['node_modules/', 'dist/', '.turbo/', '*.log']
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: await import('@typescript-eslint/parser'),
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'prefer-const': 'warn'
    }
  }
);
