/**
 * Conventional Commits, enforced by the `commit-msg` hook.
 *
 * The point is not tidiness: `CHANGELOG.md` is grouped by these types, and the
 * Renovate/release tooling reads them. A commit that does not parse is a commit
 * that silently disappears from the changelog.
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Scope is optional, but when present it should name a project — `settings`,
    // `ui`, `demo-app`, `deps`, `readme`. Not enforced as an enum: adding a lib
    // should not require editing this file.
    'scope-case': [2, 'always', 'kebab-case'],
    // Long subjects get truncated in every UI that shows them. 100 is the
    // conventional ceiling; the default is 72, which is tight for a scoped commit.
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [0],
  },
};
