export default {
  /**
   * Deliberately low. The app project is routes, page templates and app.config wiring —
   * behaviour that a unit test can only assert trivially. It is covered by the
   * Playwright suite in apps/demo-app/e2e instead, which is why this floor exists to
   * catch deletion rather than to demand growth.
   */
  coverageThreshold: {
    global: {
      statements: 5,
      branches: 0,
      functions: 0,
      lines: 5,
    },
  },
  displayName: 'demo-app',
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/apps/demo-app',
  // `e2e/` holds Playwright specs. They share the `.spec.ts` suffix, so without
  // this Jest picks them up and fails on `@playwright/test`'s globals.
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  /**
   * e2e/ holds Playwright specs, which share the `.spec.ts` suffix but import
   * `@playwright/test`. Without this Jest collects them and every suite dies on
   * the import. They run through `nx e2e demo-app`.
   */
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
