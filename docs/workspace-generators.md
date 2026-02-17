# Creating Applications and Libraries in Nx Monorepo

This guide explains how to generate new Angular applications and libraries using Nx generators.

---

## Creating a New Application

To generate a new Angular application, run:

```sh
npx nx g @nx/angular:app apps/demo

npx nx g @nx/angular:app apps/genai-cv
```

- Replace `apps/demo` or `apps/genai-cv` with your desired app name and path.
- The generator will scaffold a new standalone Angular application in the `apps/` directory.

---

## Creating a New Library

To generate a new Angular library, run:

```sh
npx nx g @nx/angular:library libs/shared/ui --tags=ui --style=scss

npx nx g @nx/angular:library libs/shared/entity --tags=entity --style=scss
```

- Replace the path and tags as needed for your use case.
- The `--tags` flag helps organize and enforce dependency constraints.
- The `--style=scss` flag sets SCSS as the default style format for the library.

---

## Best Practices

- Always use Nx generators to ensure consistency and best practices.
- Register new libraries in `.eslintrc.base.json` under `depConstraints` to maintain proper dependency boundaries.
- Use meaningful tags to categorize your libraries (e.g., `ui`, `entity`, `feature`, `util`).

For more details, see the [Nx documentation](https://nx.dev/angular).
