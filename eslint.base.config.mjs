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
  // Design tokens + ThemeService. Consumed by everything, depends on nothing.
  { sourceTag: 'scope:theme-lib', onlyDependOnLibsWithTags: [] },
  // The ANALYTICS contract. A leaf so that depending on analytics never drags a
  // vendor SDK along — only `scope:analytics-firebase-lib` may name Firebase.
  { sourceTag: 'scope:analytics-lib', onlyDependOnLibsWithTags: [] },

  {
    sourceTag: 'scope:analytics-firebase-lib',
    onlyDependOnLibsWithTags: ['scope:analytics-lib', 'scope:environment-lib'],
  },
  {
    sourceTag: 'scope:translate',
    onlyDependOnLibsWithTags: ['scope:entity-lib', 'scope:environment-lib'],
  },
  {
    sourceTag: 'scope:profile',
    onlyDependOnLibsWithTags: [
      'scope:entity-lib',
      'scope:environment-lib',
      'scope:theme-lib',
      'scope:ui-lib',
    ],
  },
  // A second feature lib, wider than profile on purpose: it consumes shared UI and
  // the theme/i18n services, which is what a feature reaching for cross-cutting
  // state actually looks like. Note it still cannot see `scope:profile` — features
  // compose through the app, never through each other.
  {
    sourceTag: 'scope:settings',
    onlyDependOnLibsWithTags: [
      'scope:entity-lib',
      'scope:environment-lib',
      'scope:theme-lib',
      'scope:translate',
      'scope:ui-lib',
    ],
  },
  {
    sourceTag: 'scope:ui-lib',
    onlyDependOnLibsWithTags: [
      'scope:analytics-lib',
      'scope:entity-lib',
      'scope:environment-lib',
      'scope:theme-lib',
      'scope:translate',
    ],
  },

  // The application composes everything. It is also the only project allowed to
  // reach `scope:analytics-firebase-lib` — choosing a vendor is a composition
  // decision, so it happens once, in app.config.ts.
  {
    sourceTag: 'scope:demo-app',
    onlyDependOnLibsWithTags: [
      'scope:analytics-lib',
      'scope:analytics-firebase-lib',
      'scope:entity-lib',
      'scope:environment-lib',
      'scope:profile',
      'scope:settings',
      'scope:theme-lib',
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
