# Changelog

All notable changes to this project are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Because this is a template, "breaking" means _breaking for someone who forked it
and wants to pull updates_ — a renamed lib, a changed provider signature, a moved
config file. Ordinary app-level additions are minor.

## [Unreleased]

### Added

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
- Renovate configuration, with a rule that moves `@ngrx/*` off `22.0.0-beta.0` as
  soon as a stable release exists.
- Firebase Hosting deploy workflow on `main` and a preview-channel workflow per
  pull request.
- Security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`) in `hosting/firebase.json`.
- `libs/shared/ui/src/lib/organisms/` — the folder the documentation had been
  claiming existed.

### Changed

- Renamed `apps/genai-app` to `apps/demo-app` and `genai.paths.ts` to
  `api.paths.ts`. The workspace contains nothing generative-AI specific; the name
  promised otherwise.
- `GlobalErrorHandler` depends on the `ANALYTICS` token instead of a concrete
  Firebase service.
- `libs/shared/ui/src/lib/header/` moved to `organisms/header/`.

### Removed

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
