/**
 * Formatting only. ESLint is deliberately **not** here.
 *
 * A bare `eslint <staged paths>` run from the repository root resolves one flat
 * config — the root one — for every file it is handed. That config sets the
 * component-selector prefix to `app`, so every library component (`lib-header`,
 * `lib-settings`) gets reported as wrongly prefixed. Each project carries its own
 * `eslint.config.mjs` with the correct prefix, and only Nx knows which file
 * belongs to which project.
 *
 * Linting therefore runs through Nx in `.husky/pre-commit`, scoped to the projects
 * the staged files actually touch.
 */
export default {
  '*.{ts,js,mjs,cjs,html,scss,css,json,md,yml,yaml}': [
    'prettier --write --ignore-unknown',
  ],
};
