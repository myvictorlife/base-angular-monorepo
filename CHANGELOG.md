# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Because this is a template, "breaking" means _breaking for someone who forked it
and wants to pull updates_ — a renamed lib, a changed provider signature, a moved
config file. Ordinary app-level additions are minor.

## [Unreleased]

### Added

- `LANGUAGE_METADATA` in `@libs/entity` — the single source of truth for
  language display data: endonym label and text direction. The header select,
  the settings radio group and `<html dir>` all derive from it, so adding a
  language is one enum line, one metadata entry and one bundle.
- `lib-language-select` (`@libs/ui`, `molecules/`) — the language picker
  extracted from the header into the design system. Options are labelled with
  endonyms (each language named in itself), never translated.
- `lib-switch` (`@libs/ui`, `atoms/`) and `lib-segmented-control` (`@libs/ui`,
  `molecules/`) — the toggle switch and the `role="radiogroup"` segmented
  control extracted from the settings page, which had implemented both inline
  (the segmented control twice). Both are controlled components: the host owns
  the value, the control only asks for a change. The switch also drops the
  literal-`#fff` knob for surface tokens, which was invisible on the dark
  theme's white brand track.
- `lib-page-header` (`@libs/ui`, `molecules/`) — the shared h1-plus-lead page
  intro, previously restyled separately by the settings and design pages.
- `github` in the shared icon set. The header and the home CTA now render it
  through `lib-icon` instead of carrying two copies of the same inline SVG;
  the header's menu/close burger also uses the set's existing icons.

### Changed

- The home page now consumes the design system — `libButton`, `lib-badge`,
  `lib-card`, `lib-icon` — and design tokens instead of hardcoded Tailwind
  neutral colours, so the landing finally follows the theme toggle. Its
  closing CTA section remaps the surface tokens locally to stay inverted in
  both themes.

- Language pickers no longer translate language names. The `LANGUAGE.*` key
  matrix (one name per language per bundle) is gone; `LANGUAGE_SELECT.*` holds
  the two remaining aria labels.

### Removed

- `UpdateLanguageComponent`, `updateLanguageRoutes` and the `/translate` route.
  The settings page supersedes it, and its hardcoded language list had already
  drifted from the enum. The `UPDATE_LANGUAGE.*` keys went with it.

- Four more languages — Spanish (`es`), German (`de`), Arabic (`ar`) and Polish
  (`pl`), for eight bundles total. `provideDocumentLanguage()` now also syncs
  `<html dir>`, so Arabic renders right-to-left; styles written with physical
  properties (`margin-left`) keep their LTR bias and are fixed case by case.
  English remains the default and fallback.
- "View source on GitHub" links (header icon + home CTA button), driven by
  `config/site.json` / `SITE_REPO_URL` through the config generator as
  `environment.repoUrl`. Absent config renders no links, so a fresh clone stays
  unbranded; the deploy workflows derive the URL from `github.repository`, so a
  fork's deploy links to the fork.
- `LICENSE` (MIT), `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md` and this changelog —
  the repository could not legally be used as a template without the first one.
- `@libs/analytics` — a vendor-neutral `ANALYTICS` token with a `NoopAnalytics`
  default, so analytics is opt-in and the core no longer knows Firebase exists.
- `@libs/analytics-firebase` — the Firebase implementation, behind
  `provideFirebaseAnalytics()`. It is the only project in the workspace that names
  Firebase.
- `@libs/settings` — a second feature library. Deliberately a different shape from
  `@libs/profile`: synchronous, locally persisted state instead of HTTP +
  `rxMethod`.
- `config/` + `tools/generate-config.mjs` — one JSON file per integration, pasted
  straight from the vendor console, compiled into typed modules under
  `libs/environment/src/lib/generated/`. Both sides are git-ignored, so no one's
  Firebase project id is ever committed. See `config/README.md`.
- Playwright end-to-end suite (`apps/demo-app/e2e/`) wired into CI, and re-run
  against the deployed preview channel on every pull request via `BASE_URL`.
- Jest coverage thresholds, enforced in CI.
- husky + lint-staged + commitlint, including a pre-commit guard that rejects a
  populated Firebase `apiKey`.
- Renovate configuration, with a rule that moves `@ngrx/*` off the 22 prerelease
  line as soon as a stable release exists.
- Firebase Hosting deploy workflow on `main` and a preview-channel workflow per
  pull request.
- Security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`) in `hosting/firebase.json`.
- `libs/shared/ui/src/lib/organisms/` — the folder the documentation had been
  claiming existed.
- Unit tests for every `@libs/ui` atom (alert, badge, button, card, icon,
  spinner, theme-toggle) and for the header organism — the coverage floor rose
  from the high thirties to the mid eighties with them.

- `AGENTS.md` — a single entry point for AI coding agents, imported by `CLAUDE.md`
  so every tool reads one file instead of a per-vendor copy.
- `tools/workspace-plugin` with a `feature-lib` generator
  (`npx nx g @app/workspace-plugin:feature-lib <name> [--shape=async]`): creates
  the complete feature-library shape from `.claude/skills/feature-lib` — files,
  `scope:` tag registered in `depConstraints` (anchored on marker comments in
  `eslint.base.config.mjs`), path alias, Vitest `test` target with the
  95/90/90/95 floor, and i18n keys seeded in all four bundles. Only the app
  route stays manual, because features compose through the app.

### Changed

- Restructured the README for first-time readers: a concrete value pitch and
  feature grid above the fold, app screenshots (light and dark), a Mermaid
  diagram of the boundary graph in place of prose-only rules, a curated table of
  contents, a "who this is for" section, and the long project tree and
  configuration deep-dive collapsed behind `<details>`. The boundary table also
  regained the `theme`/`ui` allowances for `scope:profile` it had drifted away
  from.
- Bumped Angular to 22.1 (framework `22.1.1`, CLI/build toolchain `22.1.3`), the
  Nx group to `23.1.1`, and assorted patch releases (`firebase`,
  `typescript-eslint`, `ts-node`, `@swc-node/register`, `postcss`). TypeScript
  stays on 6.0.x because Angular 22.1 peers on `>=6.0 <6.1`, and
  `@angular/platform-browser-dynamic` stays installed because Spectator imports
  `BrowserDynamicTestingModule` from it at runtime despite not declaring the
  dependency. The lockfile was regenerated in the process.
- Bumped `@ngrx/*` from `22.0.0-beta.0` to `22.0.0-rc.0` — the last prerelease
  step before the stable NgRx 22. No source changes were needed.
- **Migrated unit testing from Jest to Vitest**, through Angular's official
  `@angular/build:unit-test` builder. Per-project `jest.config.*` and
  `src/test-setup.ts` are gone; each `test` target now carries its coverage
  options in `project.json`, with the shared pieces (`buildTarget`,
  `watch: false`, caching, the `generate-config` dependency) in `nx.json`
  `targetDefaults`. Specs import Spectator from `@ngneat/spectator/vitest` and use
  `vi.*` in place of `jest.*`. Two behavioural notes: workspace aliases
  (`@libs/*`) cannot be module-mocked because the Angular build resolves them
  before Vitest sees them, and coverage is measured from the test bundle, so files
  no spec imports are invisible to the report — the `@libs/ui` and
  `@libs/translation` floors were re-based against the new measurement.
- Moved `docs/skills/*.md` to `.claude/skills/<name>/SKILL.md` with `name` and
  `description` frontmatter. They were plain markdown that nothing pointed an agent
  at; as skills they load on demand when the task matches. All inbound links
  updated.
- Rewrote the analytics skill, which still documented the removed `AnalyticsService`
  rather than the `ANALYTICS` token, and refreshed the tag graph in the
  module-boundaries skill with the analytics and settings scopes.
- `.claude/settings.local.json` is now git-ignored — it holds absolute paths from
  whichever machine wrote it.

- Renamed `apps/genai-app` to `apps/demo-app` and `genai.paths.ts` to
  `api.paths.ts`. The workspace contains nothing generative-AI specific; the name
  promised otherwise.
- `GlobalErrorHandler` depends on the `ANALYTICS` token instead of a concrete
  Firebase service.
- `libs/shared/ui/src/lib/header/` moved to `organisms/header/`.

### Fixed

- Disabled critical-CSS inlining (`inlineCritical: false`) in the production
  build. Beasties defers the stylesheet with an inline `onload` handler, which
  the CSP in `hosting/firebase.json` blocks — leaving the deployed stylesheet
  stuck at `media="print"` and non-critical styles unapplied.

### Removed

- `nxCloudId` from `nx.json`. The workspace was never claimed, so every Nx command
  printed a 401 warning and the remote cache never worked — and a fork should not
  inherit someone else's Nx Cloud identity any more than a Firebase project id.
  Connect your own with `npx nx connect` if you want distributed caching.
- Root-level `tsconfig.app.json` and `tsconfig.spec.json` — generator leftovers
  covering a `src/` tree that does not exist at the workspace root.
- `AnalyticsService` from `@libs/ui` — replaced by `ANALYTICS` +
  `@libs/analytics-firebase`.
- `apps/demo-app/src/assets/icons/delhaize-logo.png` — an unreferenced third-party
  logo left over from an unrelated project.
- `hosting/.firebaserc` from version control. It is generated now, and carried a
  placeholder project id before.

## [1.0.0]

Initial public version: Nx 23 workspace, Angular 22 standalone + zoneless, NgRx
SignalStore, ngx-translate, Tailwind 4, Jest + Spectator, Firebase Hosting.

[Unreleased]: https://github.com/myvictorlife/base-angular-monorepo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/myvictorlife/base-angular-monorepo/releases/tag/v1.0.0
