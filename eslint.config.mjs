import baseConfig from './eslint.base.config.mjs';
import nx from '@nx/eslint-plugin';

/**
 * Root config: applies to workspace-level files only. Each project has its own
 * eslint.config.mjs extending eslint.base.config.mjs, so dependency rules live
 * there — duplicating them here would only give the illusion of enforcement.
 */
export default [
  ...baseConfig,
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
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
  {
    files: ['**/*.html'],
    // Override or add rules here
    rules: {},
  },
];
