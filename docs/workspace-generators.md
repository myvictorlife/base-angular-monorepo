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

## After generating a library

The generator does **not** finish the job. Three steps remain:

1. **Add the tag to `depConstraints`** in `eslint.base.config.mjs`, listing what the new
   library may depend on. A tag with no entry is unconstrained.
2. **Add the path alias** to `tsconfig.base.json` under `compilerOptions.paths`
   (e.g. `"@libs/profile": ["libs/profile/src/index.ts"]`).
3. **Add a `test` target** to the new `project.json` plus `jest.config.ts`,
   `tsconfig.spec.json` and `src/test-setup.ts` if the library will have tests —
   and reference `./tsconfig.spec.json` from its `tsconfig.json`, otherwise the specs
   are never type-checked.

See [`skills/module-boundaries.md`](./skills/module-boundaries.md) for the full checklist.

---

## Best Practices

- Always use Nx generators to ensure consistency and best practices.
- Verify the boundary rule actually bites: add a deliberately illegal import to the new
  library and confirm `nx lint <project>` fails, then revert it.
- Keep the library's `README.md` — the generated stub says nothing useful. Document what
  the library exports and what it may depend on.

For more details, see the [Nx documentation](https://nx.dev/angular).
