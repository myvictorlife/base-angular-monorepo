import baseConfig from '../../eslint.base.config.mjs';

export default [
  ...baseConfig,
  {
    // Template files are EJS, not TypeScript — the __tmpl__ suffix keeps the
    // compiler away, this keeps the linter away.
    ignores: ['src/generators/**/files/**'],
  },
];
