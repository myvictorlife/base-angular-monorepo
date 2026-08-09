# AGENTS.md

Instructions for AI coding agents working in this repository. Humans: start with
[`README.md`](README.md) instead.

## What this repository is

An Nx monorepo template — Angular 22 standalone and zoneless, NgRx SignalStore,
ngx-translate, Tailwind 4, Vitest + Spectator, Playwright.

It is a **template**, which changes what a good change looks like. Prefer the
option that stays correct for someone who forks this and builds something you will
never see: no hardcoded project identity, no coupling that cannot be deleted, no
config that only makes sense for one product.

## Detailed guides

Task-specific instructions live in `.claude/skills/`. **Read the relevant one
before writing code** — they carry the conventions this workspace actually
enforces, and getting them wrong means a failed lint or a rejected review.

| Doing this                                   | Read                                         |
| -------------------------------------------- | -------------------------------------------- |
| Creating a feature library                   | `.claude/skills/feature-lib/SKILL.md`        |
| Writing any component or template            | `.claude/skills/angular-component/SKILL.md`  |
| Adding or changing feature state             | `.claude/skills/ngrx-state/SKILL.md`         |
| Adding a route or a lazy chunk               | `.claude/skills/lazy-loading/SKILL.md`       |
| Creating a library, or a boundary lint error | `.claude/skills/module-boundaries/SKILL.md`  |
| Writing tests, or a coverage failure         | `.claude/skills/unit-testing/SKILL.md`       |
| Tracking events                              | `.claude/skills/firebase-analytics/SKILL.md` |
| Deploying, or CI secrets                     | `.claude/skills/firebase-deploy/SKILL.md`    |

Broader background: [`docs/best-practices.md`](docs/best-practices.md),
[`docs/workspace-generators.md`](docs/workspace-generators.md),
[`config/README.md`](config/README.md).

## Setup

```sh
npm install     # also generates the integration configs
npm start       # http://localhost:4200
```

Node `^22.22.3`, `^24.15.0` or `>=26`. **No Firebase project is needed** — without
`config/firebase.json` the app builds and runs with integrations off. Never
introduce a code path that requires credentials to boot.

## Verify before reporting done

```sh
npx nx run-many -t lint test build --all
npx nx e2e demo-app --project=chromium
```

Run them. Do not report a task complete on the strength of a change compiling.

`nx affected -t lint test` is fine mid-work; run the full set before finishing.

## Non-negotiables

These are enforced by lint or by a test — breaking one fails the build.

- `@if` / `@for`, never `*ngIf` / `*ngFor`
- `input()` / `output()` functions, never `@Input` / `@Output` decorators
- `ChangeDetectionStrategy.OnPush` on every component
- Standalone components. No `NgModule`. Libraries expose a `provide*()` function
- Import what a template uses, never `CommonModule`
- Prefer signals to RxJS subscriptions in components
- A new library needs a `scope:` tag **and** a `depConstraints` entry in
  `eslint.base.config.mjs`. A tag with no entry is unconstrained, which silently
  defeats the boundary rules. For feature libraries,
  `npx nx g @app/workspace-plugin:feature-lib <name>` does both (and the alias,
  test target and i18n keys) in one step
- Every i18n key exists in every bundle — `en`, `nl`, `fr`, `pt`, `es`, `de`,
  `ar`, `pl`. `i18n-completeness.spec.ts` fails otherwise; the list of bundles
  derives from the `Language` enum, so adding a language means adding its bundle

## Architecture rules that are easy to get wrong

**Feature state is a `signalStore`, provided on its route** — not in root, not in a
component's `providers`. It is created when the feature is entered and destroyed
when it is left.

**The global NgRx Store carries router state and nothing else.** Do not add slices
to it.

**Features never import each other.** `@libs/profile` and `@libs/settings` compose
through the app, never directly. The lint rules enforce this.

**Do not duplicate state that already lives in a service.** `SettingsStore` exposes
theme and language through `withComputed` and forwards writes, because
`ThemeService` and `UpdateLanguageService` already own them as signals. Copying
them into `withState` creates a second source of truth.

**Analytics goes through the `ANALYTICS` token.** Only `@libs/analytics-firebase`
may name Firebase, and only `app.config.ts` may import it.

**Vendor SDKs load with `import()`, never a static import.** A static import pulls
the SDK into the bundle even when the integration is disabled.

## Credentials

**Nothing in `config/` or `.env` is ever committed.** Only `*.example.json` files
are. `libs/environment/src/lib/generated/` is generated and git-ignored.

A Firebase _web_ config is not a secret — it ships in every client bundle. It is
kept out of git so a fork never reports into someone else's project. Real secrets
— service account JSON, private API keys — must never reach a frontend bundle;
they belong in GitHub Actions secrets or behind a backend.

A pre-commit hook rejects a committed API key. Do not work around it.

## Conventions

Commits follow [Conventional Commits](https://www.conventionalcommits.org),
enforced by commitlint: `feat(settings): add reduced-motion preference`. Scope is
usually the project name.

When behaviour changes, update the affected skill in `.claude/skills/` and add a
`CHANGELOG.md` entry under `Unreleased`. A guide describing something that no
longer exists is worse than no guide.

## Known gaps — do not present these as solved

- Coverage is measured from the compiled test bundle: a file no spec (or route)
  imports is invisible to the report rather than counting as 0%. A healthy
  percentage in a thinly-tested project can therefore overstate the suite.
- `@ngrx/*` is pinned to `22.0.0-rc.0` because no stable NgRx 22 exists yet.
- `apps/demo-app` unit coverage is intentionally low; the app project is covered by
  the Playwright suite instead.
