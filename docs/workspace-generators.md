# Creating Applications and Libraries in Nx Monorepo

This guide explains how to generate new Angular applications and libraries using Nx generators.

---

## Creating a New Application

To generate a new Angular application, run:

```sh
npx nx g @nx/angular:app apps/demo
```

- Replace `apps/demo` with your desired app name and path.
- The generator will scaffold a new standalone Angular application in the `apps/` directory.

---

## Creating a New Library

> **Tags must use the `scope:` prefix.** `eslint.base.config.mjs` matches `depConstraints`
> on the exact tag string, so a library tagged `ui` instead of `scope:ui-lib` matches no
> rule and is left **completely unconstrained** — it can import anything, and nothing warns
> you. This is not cosmetic.

These are the tags actually in use, matching the existing projects:

```sh
# Shared UI components
npx nx g @nx/angular:library libs/shared/ui --tags=scope:ui-lib --style=scss

# Shared data models
npx nx g @nx/angular:library libs/shared/entity --tags=scope:entity-lib --style=scss

# i18n
npx nx g @nx/angular:library libs/shared/translation --tags=scope:translate --style=scss

# Feature library — one tag per feature
npx nx g @nx/angular:library libs/profile --tags=scope:profile --style=scss
```

There is no shared state library: feature state lives in a `signalStore` inside its
own feature lib. See [`skills/ngrx-state.md`](./skills/ngrx-state.md).

- Replace the path and tag as needed for your use case.
- The `--tags` flag is what drives dependency constraint enforcement.
- The `--style=scss` flag sets SCSS as the default style format for the library.

---

## Feature libraries: use the workspace generator

For a **feature** library, skip the manual steps below entirely — the local
generator performs all of them at once and its output is verified by the same
lint rules and coverage floors as the rest of the workspace:

```sh
npx nx g @app/workspace-plugin:feature-lib orders                 # local state (reference: libs/settings)
npx nx g @app/workspace-plugin:feature-lib orders --shape=async  # HTTP + rxMethod (reference: libs/profile)
```

It creates the library shape from `.claude/skills/feature-lib`, registers the
`scope:` tag in `depConstraints` (anchored on the `<feature-scopes>` markers in
`eslint.base.config.mjs` — keep those comments), adds the path alias, the Vitest
`test` target and the i18n keys. Only the app route remains manual.

The steps below still apply when creating a **non-feature** library (a shared
`ui`-style or leaf lib) with the stock Nx generator.

## After generating a library manually

The stock generator does **not** finish the job. Three steps remain:

1. **Add the tag to `depConstraints`** in `eslint.base.config.mjs`, listing what the new
   library may depend on. A tag with no entry is unconstrained.
2. **Add the path alias** to `tsconfig.base.json` under `compilerOptions.paths`
   (e.g. `"@libs/profile": ["libs/profile/src/index.ts"]`).
3. **Add a `test` target** to the new `project.json` (executor
   `@angular/build:unit-test`, with the coverage options — copy the shape from
   `libs/settings/project.json`) plus a `tsconfig.spec.json` if the library will
   have tests — and reference `./tsconfig.spec.json` from its `tsconfig.json`,
   otherwise the specs are never type-checked. The shared pieces (`buildTarget`,
   `watch`, caching, the `generate-config` dependency) come from `targetDefaults`
   in `nx.json`.

See [`skills/module-boundaries.md`](./skills/module-boundaries.md) for the full checklist.

---

## Best Practices

- Always use Nx generators to ensure consistency and best practices.
- Verify the boundary rule actually bites: add a deliberately illegal import to the new
  library and confirm `nx lint <project>` fails, then revert it.
- Keep the library's `README.md` — the generated stub says nothing useful. Document what
  the library exports and what it may depend on.

For more details, see the [Nx documentation](https://nx.dev/angular).
