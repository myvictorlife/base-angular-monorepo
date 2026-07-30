import nx from '@nx/eslint-plugin';

/**
 * Every project's eslint.config.mjs extends THIS file, not the root
 * eslint.config.mjs. Dependency rules therefore have to live here — kept in the
 * root config they never run for any project, which is how `scope:` tags drifted
 * out of sync without anyone noticing.
 *
 * Each entry mirrors what the library is actually allowed to reach. Importing
 * something not listed is a lint error, which is the point.
 */
const depConstraints = [
  // Leaf libraries: no workspace dependencies at all.
  { sourceTag: 'scope:entity-lib', onlyDependOnLibsWithTags: [] },
  { sourceTag: 'scope:environment-lib', onlyDependOnLibsWithTags: [] },

  {
    sourceTag: 'scope:shared-store',
    onlyDependOnLibsWithTags: ['scope:entity-lib', 'scope:environment-lib'],
  },
  {
    sourceTag: 'scope:translate',
    onlyDependOnLibsWithTags: ['scope:entity-lib', 'scope:environment-lib'],
  },
  {
    sourceTag: 'scope:profile',
    onlyDependOnLibsWithTags: ['scope:entity-lib', 'scope:environment-lib'],
  },
  {
    sourceTag: 'scope:ui-lib',
    onlyDependOnLibsWithTags: [
      'scope:entity-lib',
      'scope:environment-lib',
      'scope:shared-store',
      'scope:translate',
    ],
  },

  // The application composes everything.
  {
    sourceTag: 'scope:genai-app',
    onlyDependOnLibsWithTags: [
      'scope:entity-lib',
      'scope:environment-lib',
      'scope:profile',
      'scope:shared-store',
      'scope:translate',
      'scope:ui-lib',
    ],
  },
];

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
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
          depConstraints,
        },
      ],
    },
  },
];
