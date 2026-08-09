# ui

The design system — reusable presentational components in Atomic Design layers —
plus the app-wide cross-cutting concerns.

**Tag:** `scope:ui-lib` — may depend on `scope:analytics-lib`, `scope:entity-lib`,
`scope:environment-lib`, `scope:theme-lib` and `scope:translate`. It must **not**
depend on a feature library; features depend on `ui`, never the reverse.

## Storybook

Every component has a colocated `*.stories.ts`. Run the catalogue locally:

```sh
npx nx storybook ui        # http://localhost:4400
npx nx build-storybook ui  # static build in dist/storybook/ui
```

The toolbar switches the design-token **theme** (light/dark via `data-theme`, the
same attribute `ThemeService` drives) and the text **direction** (LTR/RTL — what
Arabic renders under). Stories use the app's real i18n bundles and fonts, served
via `staticDirs`. Conventions for writing a story: `.claude/skills/storybook/`.

## Import

```ts
import {
  ButtonComponent,
  HeaderComponent,
  IconComponent /* … */,
} from '@libs/ui';
```

## Contents

| Layer    | Component                      | Selector                            | Notes                                                                             |
| -------- | ------------------------------ | ----------------------------------- | --------------------------------------------------------------------------------- |
| atom     | `AlertComponent`               | `lib-alert`                         | 4 tones; `danger` uses `role="alert"`, slot `[alert-actions]`                     |
| atom     | `BadgeComponent`               | `lib-badge`                         | 6 tones × solid/soft/outline, `pill`                                              |
| atom     | `ButtonComponent`              | `button[libButton]`, `a[libButton]` | attribute selector; primary/secondary/ghost/danger × sm/md/lg, `block`            |
| atom     | `CardComponent`                | `lib-card`                          | padding scale, `elevated`, slots `[card-header]`/`[card-footer]`                  |
| atom     | `IconComponent`                | `lib-icon`                          | inline SVG set, names in `ICON_NAMES`                                             |
| atom     | `SpinnerComponent`             | `lib-spinner`                       | sm/md/lg                                                                          |
| atom     | `SwitchComponent`              | `lib-switch`                        | controlled `role="switch"`; host owns the value                                   |
| atom     | `ThemeToggleComponent`         | `lib-theme-toggle`                  | injects `ThemeService`                                                            |
| molecule | `LanguageSelectComponent`      | `lib-language-select`               | endonym labels from `LANGUAGE_METADATA`; injects `UpdateLanguageService`          |
| molecule | `PageHeaderComponent`          | `lib-page-header`                   | h1 + lead from i18n keys                                                          |
| molecule | `SegmentedControlComponent<T>` | `lib-segmented-control`             | controlled `role="radiogroup"`; options label via `labelKey` or literal `label`   |
| organism | `HeaderComponent`              | `lib-header`                        | composes language select, theme toggle, conditional GitHub link (`repoUrl` input) |

### Cross-cutting

- `GlobalErrorHandler` — reports uncaught errors through the `ANALYTICS` token as
  `app_exception`, then delegates to Angular's default handler. Registered in
  `app.config.ts` with `{ provide: ErrorHandler, useClass: GlobalErrorHandler }`.
- `httpErrorInterceptor` — logs failed requests as `http_error` and **re-throws**;
  a reporting point, not a handler. `status: 0` means the request never reached
  the server. Wire with `provideHttpClient(withInterceptors([httpErrorInterceptor]))`.

## Rules

- **Presentational only** for components: inputs in, outputs out, no HTTP, no feature
  state. Anything that fetches belongs in the feature that owns it. (The two
  service-injecting components — theme toggle, language select — drive app-wide
  preferences, which is still presentation, not feature state.)
- `ChangeDetectionStrategy.OnPush` is mandatory (enforced by lint since angular-eslint 22).
- Import only the pipes/directives a template uses — `TranslatePipe`, `RouterLink`,
  `UpperCasePipe` — never `CommonModule`.
- Prefix is `lib` (`lib-header`), set in `eslint.config.mjs`.

## Assets

Icons and the header logo are **inline SVG**, not remote images. Nothing in this
library may reference a third-party domain — the app ships with zero external
origins, and the self-hosted fonts in `apps/demo-app/public/fonts` exist for the
same reason.
