const nxPreset = require('@nx/jest/preset').default;

/**
 * Shared Jest configuration for every project in the workspace.
 *
 * ## Coverage
 *
 * `collectCoverageFrom` is the important line here. Without it Jest reports on
 * *files a test happened to import*, which makes an untested component invisible
 * and turns the percentage into a number that only ever goes up. Measuring the
 * whole `src` tree is less flattering and considerably more useful.
 *
 * Excluded on purpose: barrel files re-export and contain no logic, `*.routes.ts`
 * are declarations exercised by the e2e suite, and `generated/` is written by
 * `tools/generate-config.mjs`.
 *
 * The thresholds themselves live in each project's own `jest.config`, set just
 * under what that project measures today. A single workspace-wide number would
 * have to be the lowest project's, which protects nothing — per-project floors
 * ratchet independently, so `@libs/analytics` cannot slip from 100% just because
 * `@libs/ui` has not caught up yet. Raise a floor whenever its real number moves.
 *
 * `npx nx run-many -t test --all --coverage` prints where each project stands.
 */
module.exports = {
  ...nxPreset,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/index.ts',
    '!src/**/*.routes.ts',
    '!src/**/*.spec.ts',
    '!src/test-setup.ts',
    '!src/**/generated/**',
  ],
};
