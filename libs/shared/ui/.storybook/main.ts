import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  /**
   * Served straight from the demo app so Storybook needs no assets of its own:
   * `public/` carries the self-hosted Inter files that `fonts.css` references
   * as absolute `/fonts/*` URLs, and `assets/` carries the real i18n bundles —
   * the translate pipe in page-header/language-select/header loads them over
   * HTTP at runtime, which keeps the ui lib from *importing* app files (the
   * module boundaries forbid that; serving is not importing).
   */
  staticDirs: [
    { from: '../../../../apps/demo-app/public', to: '/' },
    { from: '../../../../apps/demo-app/src/assets', to: '/assets' },
  ],
};

export default config;
