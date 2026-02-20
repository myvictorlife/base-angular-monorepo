import baseConfig from './eslint.base.config.mjs';
import nx from '@nx/eslint-plugin';

export default [
  ...baseConfig,
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allowCircularSelfDependency: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
          depConstraints: [
            {
              sourceTag: 'scope:environment-lib',
              onlyDependOnLibsWithTags: [],
            },{
              sourceTag: 'scope:entity-lib',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'scope:shared-store',
              onlyDependOnLibsWithTags: [
                'scope:entity-lib',
                'scope:environment-lib'
              ],
            },{
              sourceTag: 'scope:profile',
              onlyDependOnLibsWithTags: [
                'scope:entity-lib',
                'scope:environment-lib'
              ],
            },{
              sourceTag: 'scope:translate',
              onlyDependOnLibsWithTags: [
                'scope:entity-lib',
                'scope:environment-lib'
              ],
            },{
              sourceTag: 'scope:genai-app',
              onlyDependOnLibsWithTags: [
                'scope:entity-lib',
                'scope:ui-lib',
                'scope:shared-store',
                'scope:environment-lib',
                'scope:profile'
              ],
            },{
              sourceTag: 'scope:ui-lib',
              onlyDependOnLibsWithTags: [
                'scope:entity-lib',
                'scope:shared-store',
                'scope:standalone-lib',
                'scope:auth-lib',
                'scope:shared-service-lib',
                'scope:environment-lib',
                'scope:translate'
              ],
            }
          ],
        },
      ],
    },
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
