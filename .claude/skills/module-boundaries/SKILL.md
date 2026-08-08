---
name: module-boundaries
description: Nx tags and the ESLint depConstraints that enforce them. Use when creating a library, choosing or registering a scope: tag, or fixing an @nx/enforce-module-boundaries lint error. A tag with no depConstraints entry is unconstrained, which silently defeats the rules.
---

# Skill: Module Boundaries — ESLint + Nx Tags

This project enforces dependency rules between libraries using `@nx/enforce-module-boundaries`.
Every time you create a new library or application, you **must** register it in both `project.json` and `eslint.base.config.mjs`.

---

## How it works — the full chain

```
project.json          eslint.base.config.mjs
────────────          ─────────────────
"tags": [             sourceTag: 'scope:profile'
  "scope:profile"  ──►  onlyDependOnLibsWithTags: [...]
]
```

Nx reads the `tags` array from each `project.json` and uses them to resolve the `sourceTag` in the ESLint config. If a project with tag `scope:profile` tries to import from a project not listed in its `onlyDependOnLibsWithTags`, ESLint throws an error.

---

## Tag naming convention

| Project type           | Tag pattern             | Example                            |
| ---------------------- | ----------------------- | ---------------------------------- |
| Application            | `scope:<app-name>`      | `scope:demo-app`                   |
| Feature library        | `scope:<feature-name>`  | `scope:profile`                    |
| Shared utility library | `scope:<name>-lib`      | `scope:entity-lib`, `scope:ui-lib` |
| Environment            | `scope:environment-lib` | `scope:environment-lib`            |

The `scope:` prefix is mandatory. It is what connects the `project.json` tag to the `sourceTag` in the ESLint config.

---

## Current projects and their tags

| Project            | Path                             | `project.json` tag             | Can depend on                                                    |
| ------------------ | -------------------------------- | ------------------------------ | ---------------------------------------------------------------- |
| demo-app           | `apps/demo-app`                  | `scope:demo-app`               | everything below                                                 |
| environment        | `libs/environment`               | `scope:environment-lib`        | _(nothing)_                                                      |
| entity             | `libs/shared/entity`             | `scope:entity-lib`             | _(nothing)_                                                      |
| theme              | `libs/theme`                     | `scope:theme-lib`              | _(nothing)_                                                      |
| analytics          | `libs/shared/analytics`          | `scope:analytics-lib`          | _(nothing)_                                                      |
| analytics-firebase | `libs/shared/analytics-firebase` | `scope:analytics-firebase-lib` | analytics-lib, environment-lib                                   |
| translation        | `libs/shared/translation`        | `scope:translate`              | entity-lib, environment-lib                                      |
| ui                 | `libs/shared/ui`                 | `scope:ui-lib`                 | analytics-lib, entity-lib, environment-lib, theme-lib, translate |
| profile            | `libs/profile`                   | `scope:profile`                | entity-lib, environment-lib                                      |
| settings           | `libs/settings`                  | `scope:settings`               | entity-lib, environment-lib, theme-lib, translate, ui-lib        |

---

## Dependency graph (allowed imports)

```
demo-app                                    ← the only project that may compose everything
├── @libs/entity              (scope:entity-lib)
├── @libs/ui                  (scope:ui-lib)
├── @libs/theme               (scope:theme-lib)
├── @libs/translation         (scope:translate)
├── @libs/environment         (scope:environment-lib)
├── @libs/analytics           (scope:analytics-lib)
├── @libs/analytics-firebase  (scope:analytics-firebase-lib)
├── @libs/profile             (scope:profile)
└── @libs/settings            (scope:settings)

profile
├── @libs/entity              (scope:entity-lib)
└── @libs/environment         (scope:environment-lib)

settings
├── @libs/entity              (scope:entity-lib)
├── @libs/environment         (scope:environment-lib)
├── @libs/theme               (scope:theme-lib)
├── @libs/translation         (scope:translate)
└── @libs/ui                  (scope:ui-lib)

shared/ui
├── @libs/analytics           (scope:analytics-lib)
├── @libs/entity              (scope:entity-lib)
├── @libs/environment         (scope:environment-lib)
├── @libs/theme               (scope:theme-lib)
└── @libs/translation         (scope:translate)

shared/analytics-firebase
├── @libs/analytics           (scope:analytics-lib)
└── @libs/environment         (scope:environment-lib)

shared/translation
├── @libs/entity              (scope:entity-lib)
└── @libs/environment         (scope:environment-lib)

shared/entity     →  (no dependencies)
shared/analytics  →  (no dependencies)
environment       →  (no dependencies)
theme             →  (no dependencies)
```

**Imports NOT allowed (ESLint will error):**

- `profile` importing from `@libs/settings`, or `settings` from `@libs/profile` —
  **features never see each other.** They compose through the app.
- Any library except the app importing `@libs/analytics-firebase` — picking a
  vendor is a composition decision, made once in `app.config.ts`. Libraries depend
  on `@libs/analytics`, the contract, and never learn what is behind it.
- `shared/entity`, `theme`, `analytics` or `environment` importing anything
- `shared/translation` importing from `@libs/profile`

There is deliberately **no shared state library**. Feature state lives in a
`signalStore` inside its own feature lib (see the `ngrx-state` skill), so a
cross-cutting `@libs/store` would only invite duplicated sources of truth.

---

## Step-by-step: registering a new library

> **Feature libraries: skip this section.**
> `npx nx g @app/workspace-plugin:feature-lib <name>` performs every step below
> in one run, anchored on the `// <feature-scopes>` and
> `// <demo-app-feature-scopes>` marker comments in `eslint.base.config.mjs` —
> never delete those markers. The manual steps remain for non-feature libraries
> (a new shared or leaf lib) and for understanding what the generator does.

### 1. Set the tag in `project.json`

```json
// libs/<feature-name>/project.json
{
  "name": "<feature-name>",
  "tags": ["scope:<feature-name>"],
  ...
}
```

### 2. Add the `sourceTag` entry in `eslint.base.config.mjs`

```js
// eslint.base.config.mjs — inside depConstraints array
{
  sourceTag: 'scope:<feature-name>',
  onlyDependOnLibsWithTags: [
    'scope:entity-lib',
    'scope:environment-lib',
    // add other allowed tags here
  ],
},
```

### 3. Add the inverse rule for any project that needs to import the new lib

If `demo-app` needs to import your new library, add `scope:<feature-name>` to its `onlyDependOnLibsWithTags`:

```js
{
  sourceTag: 'scope:demo-app',
  onlyDependOnLibsWithTags: [
    'scope:entity-lib',
    'scope:ui-lib',
    'scope:environment-lib',
    'scope:profile',
    'scope:<feature-name>',  // ← add here
  ],
},
```

---

## Complete example — adding `libs/orders`

**Step 1 — `libs/orders/project.json`:**

```json
{
  "name": "orders",
  "tags": ["scope:orders"],
  ...
}
```

**Step 2 — `tsconfig.base.json`:**

```json
"@libs/orders": ["libs/orders/src/index.ts"]
```

**Step 3 — `eslint.base.config.mjs`:**

```js
depConstraints: [
  // existing entries...
  {
    sourceTag: 'scope:orders',
    onlyDependOnLibsWithTags: ['scope:entity-lib', 'scope:environment-lib'],
  },
  {
    sourceTag: 'scope:demo-app',
    onlyDependOnLibsWithTags: [
      'scope:entity-lib',
      'scope:ui-lib',
      'scope:environment-lib',
      'scope:profile',
      'scope:orders', // ← added
    ],
  },
];
```

---

## Verifying the rules

Run lint across all projects to validate:

```sh
npx nx run-many --target=lint --all
```

If you import from a lib that is not allowed, you will see:

```
A project tagged with "scope:profile" can only depend on libs tagged with
"scope:entity-lib", "scope:environment-lib"
```

---

## Checklist when creating a new library

- [ ] `project.json` has `"tags": ["scope:<name>"]`
- [ ] `eslint.base.config.mjs` has a `sourceTag: 'scope:<name>'` entry with its allowed dependencies
- [ ] Any project that needs to import the new lib has `'scope:<name>'` in its `onlyDependOnLibsWithTags`
- [ ] `tsconfig.base.json` has the `@libs/<name>` path alias
- [ ] `npx nx run-many --target=lint --all` passes with no errors
