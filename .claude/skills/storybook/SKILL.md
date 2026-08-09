---
name: storybook
description: Run the design-system Storybook and write stories for @libs/ui components. Use when adding or changing a component in libs/shared/ui, when a story fails the CI build-storybook step, or when configuring the Storybook hosting site.
---

# Storybook

The design system (`libs/shared/ui`) has a Storybook attached to the `ui` project.

```sh
npx nx storybook ui        # dev server on http://localhost:4400
npx nx build-storybook ui  # static build → dist/storybook/ui (runs in CI)
```

## How it is wired

- Config in `libs/shared/ui/.storybook/`. `styles.scss` there mirrors the app's
  global stylesheet (`tailwindcss` + the `libs/theme` token index); the
  `stylePreprocessorOptions.includePaths` on the `build-storybook` target makes
  `@use 'index'` resolve, exactly like the app build.
- `staticDirs` serves `apps/demo-app/public` (fonts) and `apps/demo-app/src/assets`
  (the real i18n bundles). Serving is not importing — the ui lib still never
  imports app files, so module boundaries hold.
- `preview.ts` provides zoneless change detection, HttpClient, an empty router and
  ngx-translate with the HTTP loader. Two toolbar globals: **theme** (sets
  `data-theme` + the `dark` class, mirroring `ThemeService.apply()`) and **dir**
  (LTR/RTL).

## Writing a story

One `<component>.stories.ts` colocated with the component, CSF3:

```ts
import type { Meta, StoryObj } from '@storybook/angular';
import { BadgeComponent } from './badge';

const meta: Meta<BadgeComponent> = {
  title: 'Atoms/Badge',
  component: BadgeComponent,
  render: (args) => ({
    props: args,
    template: `<lib-badge [tone]="tone">Badge</lib-badge>`,
  }),
  args: { tone: 'neutral' },
};
export default meta;
export const Playground: StoryObj<BadgeComponent> = {};
```

Rules that are easy to get wrong here:

- **Components with `<ng-content>` need a `render` template** — `component` alone
  renders an empty element.
- **Button is an attribute selector** (`button[libButton]`) — always a template:
  `<button libButton variant="primary">…</button>`.
- **Only use i18n keys that already exist** (`SETTINGS.*`, `DESIGN.*`, `HEADER.*`).
  A new key means adding it to all eight bundles or `i18n-completeness.spec.ts`
  fails.
- Layout styling inside story templates uses design tokens (`var(--space-3)`),
  never literal colours.
- Titles follow the folder layer: `Atoms/…`, `Molecules/…`, `Organisms/…`.
- `*.stories.ts` is excluded from the lib build (`tsconfig.lib.json`) and from
  coverage (`project.json` → `coverageExclude`). A new story file needs no config.

## Hosting

The built Storybook deploys as a second Firebase Hosting site, target
`storybook` in `hosting/firebase.json`. The mapping only exists when
`FIREBASE_STORYBOOK_SITE` is set (`.env` locally, a GitHub Actions **variable**
in CI) — without it the deploy steps skip and a fork ships nothing extra.

```sh
firebase hosting:sites:create <site-id>   # once, in the Firebase project
npm run build:deploy:storybook            # build + deploy from local
```

CI deploys it on push to `main` (`deploy.yml`), and `ci.yml` runs
`build-storybook` on every PR so a broken story fails before merge.
