import playwright from 'eslint-plugin-playwright';
import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.base.config.mjs';

export default [
  {
    // Scoped to e2e/: the Playwright rules assume Playwright's `test()`, so
    // applied workspace-wide they flag every `expect` inside a Vitest `it()` as a
    // standalone expect.
    ...playwright.configs['flat/recommended'],
    files: ['e2e/**/*.ts'],
  },
  ...baseConfig,
  ...nx.configs['flat/angular'],
  ...nx.configs['flat/angular-template'],
  {
    files: ['**/*.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
];
