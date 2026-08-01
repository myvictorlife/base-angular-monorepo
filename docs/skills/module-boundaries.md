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

| Project     | Path                      | `project.json` tag      | Can depend on                                           |
| ----------- | ------------------------- | ----------------------- | ------------------------------------------------------- |
| demo-app    | `apps/demo-app`           | `scope:demo-app`        | entity-lib, ui-lib, translate, environment-lib, profile |
| environment | `libs/environment`        | `scope:environment-lib` | _(nothing)_                                             |
| entity      | `libs/shared/entity`      | `scope:entity-lib`      | _(nothing)_                                             |
| translation | `libs/shared/translation` | `scope:translate`       | entity-lib, environment-lib                             |
| ui          | `libs/shared/ui`          | `scope:ui-lib`          | entity-lib, translate, environment-lib                  |
| profile     | `libs/profile`            | `scope:profile`         | entity-lib, environment-lib                             |

---

## Dependency graph (allowed imports)

```
demo-app
├── @libs/entity          (scope:entity-lib)
├── @libs/ui              (scope:ui-lib)
├── @libs/translation     (scope:translate)
├── @libs/environment     (scope:environment-lib)
└── @libs/profile         (scope:profile)

profile
├── @libs/entity          (scope:entity-lib)
└── @libs/environment     (scope:environment-lib)

shared/translation
├── @libs/entity          (scope:entity-lib)
└── @libs/environment     (scope:environment-lib)

shared/ui
├── @libs/entity          (scope:entity-lib)
├── @libs/translation     (scope:translate)
└── @libs/environment     (scope:environment-lib)

shared/entity  →  (no dependencies)
environment    →  (no dependencies)
```

**Imports NOT allowed (ESLint will error):**

- `profile` importing from `@libs/ui` or `@libs/translation`
- `shared/entity` importing from anything
- `shared/translation` importing from `@libs/profile`

There is deliberately **no shared state library**. Feature state lives in a
`signalStore` inside its own feature lib (see [`ngrx-state.md`](./ngrx-state.md)),
so a cross-cutting `@libs/store` would only invite duplicated sources of truth.

---

## Step-by-step: registering a new library

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
