# Base NX Monorepo — Angular + NgRx Signals

A production-ready base project for developing scalable Angular applications using modern standards. Use this as a starting point for your own project.

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Angular (standalone, **zoneless**) | 22.0.x |
| Feature state | NgRx **SignalStore** (`@ngrx/signals`) | 22.x |
| Global state | NgRx Store — router state only | 22.x |
| i18n | ngx-translate (signal-based) | 18.x |
| Monorepo | Nx | 23.x |
| Testing | Jest + Spectator | 30.x / 22.x |
| Styling | Tailwind CSS + SCSS | 4.x |
| Language | TypeScript | 6.0.x |
| Linting | ESLint + Prettier | 9.x / 3.x |

> **No NgModules and no zone.js.** Every library exposes a provider function
> (`provideTranslation()`) or, for feature state, a `signalStore` class listed in the
> route's `providers` (`ProfileStore`). See [`docs/best-practices.md`](docs/best-practices.md).

> ⚠️ **`@ngrx/*` is currently on `22.0.0-beta.0`.** NgRx 22 has no stable release yet and
> Angular 22 requires it (NgRx 21 peers on `@angular/core@^21`). Move to the stable
> release when it ships — no source changes are expected.

---

## Project Structure

```
base-angular-monorepo/
│
├── apps/                                   # Application entry points
│   └── genai-app/                          # Main Angular application
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/                   # Core services and global state
│       │   │   │   ├── +state/             # NgRx router state
│       │   │   │   │   └── index.ts
│       │   │   │   └── services/router/
│       │   │   │       └── router-serializer.ts
│       │   │   ├── pages/                  # Route-level page components
│       │   │   │   ├── home/
│       │   │   │   ├── not-found/
│       │   │   │   └── pages.routes.ts
│       │   │   ├── app.config.ts           # Application providers setup
│       │   │   ├── app.routes.ts           # Root routing configuration
│       │   │   └── app.ts                  # Root component
│       │   ├── assets/i18n/                # en · nl · fr · pt translation bundles
│       │   ├── main.ts                     # Bootstrap entry point
│       │   ├── fonts.css                   # Self-hosted Inter @font-face rules
│       │   ├── index.html
│       │   └── styles.scss                 # Global styles
│       ├── public/                         # Copied verbatim (favicon, fonts/)
│       ├── project.json                    # Nx project configuration
│       ├── jest.config.ts
│       └── eslint.config.mjs
│
├── libs/                                   # Shared libraries
│   │
│   ├── environment/                        # Environment configuration
│   │   └── src/lib/
│   │       ├── environment.model.ts        # Environment interface (prevents drift)
│   │       ├── environment.ts              # Production config
│   │       ├── environment.development.ts  # Development config
│   │       ├── environment.local.ts        # Local config
│   │       └── genai.paths.ts              # API path constants
│   │
│   ├── profile/                            # Profile feature library
│   │   └── src/lib/
│   │       ├── +state/
│   │       │   └── profile.store.ts        # signalStore — state, computed, methods
│   │       ├── molecules/                  # Compound components (Atomic Design)
│   │       │   └── user-info/
│   │       ├── pages/
│   │       │   ├── profile/
│   │       │   └── user.routes.ts          # Provides ProfileStore on the route
│   │       └── services/profile/
│   │           └── profile.service.ts
│   │
│   └── shared/                             # Cross-cutting shared libraries
│       │
│       ├── entity/                         # Data models and interfaces
│       │   └── src/lib/entity/
│       │       ├── error/error.model.ts
│       │       ├── language/language.enum.ts
│       │       ├── router-state/router-state-url.model.ts
│       │       └── user/user.model.ts
│       │
│       ├── translation/                    # i18n setup and language switching
│       │   └── src/lib/
│       │       ├── core/
│       │       │   ├── translation.providers.ts    # provideTranslation()
│       │       │   ├── language-storage.ts         # localStorage persistence
│       │       │   ├── document-language.ts        # keeps <html lang> in sync
│       │       │   ├── translated-title.strategy.ts # translated <title> per route
│       │       │   └── update-language.service.ts
│       │       └── pages/update-language/
│       │
│       └── ui/                             # Reusable UI + app-wide cross-cutting
│           └── src/lib/
│               ├── core/
│               │   ├── global-error-handler.ts     # reports to Analytics
│               │   └── http-error.interceptor.ts
│               ├── header/
│               └── services/analytics/
│
├── docs/                                   # Project documentation
│   ├── best-practices.md                   # Angular coding standards and patterns
│   ├── workspace-generators.md             # Nx generator commands reference
│   └── skills/                             # Development guides for Claude Code
│
├── hosting/                                # Firebase Hosting config
├── .github/workflows/ci.yml                # CI/CD pipeline
├── nx.json                                 # Nx workspace configuration
├── tsconfig.base.json                      # Shared TypeScript paths and config
├── eslint.base.config.mjs                  # Shared ESLint rules + depConstraints
├── jest.preset.js                          # Shared Jest preset
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js `^22.22.3` or `^24.15.0` or `>=26`** — required by Angular 22
- npm >= 10

### Install dependencies

```sh
npm install
```

### Run the application

```sh
npx nx serve genai-app                        # development
npx nx serve genai-app --configuration=local  # local environment
```

### Run tests

```sh
npx nx test genai-app                  # single project
npx nx run-many --target=test --all    # all projects
```

### Lint

```sh
npx nx run-many --target=lint --all
```

### Build

```sh
npx nx build genai-app --configuration=production
```

Three configurations exist — `production`, `development` and `local` — each swapping
`libs/environment/src/lib/environment.ts` for its variant.

---

## Generating New Apps and Libraries

### New application

```sh
npx nx g @nx/angular:app apps/<app-name>
```

### New library

Tags **must** use the `scope:` prefix — `eslint.base.config.mjs` matches on it, and a
library tagged otherwise silently escapes every dependency rule.

```sh
# Shared UI components
npx nx g @nx/angular:library libs/shared/ui --tags=scope:ui-lib --style=scss

# Shared data models
npx nx g @nx/angular:library libs/shared/entity --tags=scope:entity-lib --style=scss

# Feature library
npx nx g @nx/angular:library libs/<feature-name> --tags=scope:<feature-name> --style=scss

# Translations
npx nx g @nx/angular:library libs/shared/translation --tags=scope:translate
```

> After creating a library, add its tag to `depConstraints` in `eslint.base.config.mjs`.
> A tag with no entry there is **unconstrained**. See
> [`docs/skills/module-boundaries.md`](docs/skills/module-boundaries.md).

---

## Architecture

### Library Tags and Dependency Rules

Defined in `eslint.base.config.mjs` — the file every project's `eslint.config.mjs`
extends. (The root `eslint.config.mjs` applies to workspace-level files only; rules
placed there would never run for a project.)

| Tag | May depend on | Purpose |
|---|---|---|
| `scope:entity-lib` | *nothing* | Data models and interfaces |
| `scope:environment-lib` | *nothing* | Environment configuration |
| `scope:translate` | entity, environment | i18n setup, language switching |
| `scope:profile` | entity, environment | Profile feature |
| `scope:ui-lib` | entity, environment, translate | Presentational + cross-cutting UI |
| `scope:genai-app` | all of the above | The application composes everything |

### Atomic Design (component organization)

```
atoms/       → Basic reusable elements (buttons, inputs)
molecules/   → Combinations of atoms (user-info card)
organisms/   → Complete structures (header, sidebar)
pages/       → Route-level components
```

### State Pattern

**Feature state is a `signalStore`**, provided on its route:

```
libs/<feature>/src/lib/
├── +state/
│   └── <feature>.store.ts     # withState · withComputed · withMethods
└── pages/
    └── <feature>.routes.ts    # providers: [<Feature>Store, <Feature>Service]
```

The global NgRx Store carries **router state and nothing else**. Features do not add
slices to it. See [`docs/skills/ngrx-state.md`](docs/skills/ngrx-state.md).

### Internationalisation

Four bundles live in `apps/genai-app/src/assets/i18n/` — `en`, `nl`, `fr`, `pt`.
`provideTranslation()` wires the loader, restores the language from `localStorage`,
keeps `<html lang>` in sync and translates each route's `<title>`.

Adding a language means adding it to the `Language` enum and dropping in the JSON
bundle — `i18n-completeness.spec.ts` fails until every key is present in every
language, so bundles cannot drift.

---

## Code Standards

This project enforces **modern Angular** patterns. See [`docs/best-practices.md`](docs/best-practices.md) for the full guide.

Key rules:

- Use `@if` / `@for` — never `*ngIf` / `*ngFor`
- Use `input()` / `output()` functions — never `@Input` / `@Output` decorators
- Standalone components only — **no NgModules**, use provider functions
- `ChangeDetectionStrategy.OnPush` on every component (enforced by lint)
- Import only what a template uses (`TranslatePipe`, `RouterLink`) — not `CommonModule`
- Prefer signals over RxJS subscriptions in components

---

## npm Scripts

| Command | Description |
|---|---|
| `npm start` | Serve the application |
| `npm test` | Run tests |
| `npm run test:all` | Run all project tests |
| `npm run lint:all` | Lint all projects |
| `npm run build:deploy:firebase` | Production build + deploy to Firebase Hosting |

---

## Documentation

- [`docs/best-practices.md`](docs/best-practices.md) — Angular and project coding standards
- [`docs/workspace-generators.md`](docs/workspace-generators.md) — Nx generator reference

### Development Skills (Claude Code)

Step-by-step guides for developing correctly in this project:

| Skill | Description |
|---|---|
| [`docs/skills/feature-lib.md`](docs/skills/feature-lib.md) | Creating a complete feature library (uses `libs/profile` as reference) |
| [`docs/skills/lazy-loading.md`](docs/skills/lazy-loading.md) | Lazy loading rules — what to export, how to wire routes, common mistakes |
| [`docs/skills/ngrx-state.md`](docs/skills/ngrx-state.md) | SignalStore pattern — state, computed, methods, and migrating off the classic store |
| [`docs/skills/angular-component.md`](docs/skills/angular-component.md) | Modern Angular component patterns — signals, input/output, control flow |
| [`docs/skills/unit-testing.md`](docs/skills/unit-testing.md) | Unit testing with Jest and Spectator |
| [`docs/skills/module-boundaries.md`](docs/skills/module-boundaries.md) | Nx tags, ESLint boundary rules, registration steps |
| [`docs/skills/firebase-analytics.md`](docs/skills/firebase-analytics.md) | Analytics setup and event logging |
| [`docs/skills/firebase-deploy.md`](docs/skills/firebase-deploy.md) | Build and deploy to Firebase Hosting |
