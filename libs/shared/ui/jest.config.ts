export default {
  /**
   * HONEST FLOOR, NOT A TARGET. header and theme-toggle are tested; the atoms (button,
   * card, alert, badge, icon, spinner) are not. This is the largest coverage gap in the
   * workspace — see CONTRIBUTING.md.
   */
  coverageThreshold: {
    global: {
      statements: 38,
      branches: 18,
      functions: 45,
      lines: 37,
    },
  },
  displayName: 'ui',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/libs/shared/ui',
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
};
