# entity

Data models and interfaces shared across the workspace.

**Tag:** `scope:entity-lib` — **may not depend on any other library.** It sits at the
bottom of the dependency graph so anything can import it without creating a cycle.

## Import

```ts
import { User, IGenericError, Language, RouterStateUrl } from '@libs/entity';
```

## Contents

| Export | File | Purpose |
|---|---|---|
| `User` | `entity/user/user.model.ts` | User/profile shape |
| `IGenericError` | `entity/error/error.model.ts` | `{ message, code, status }` — the error shape services and stores speak |
| `Language` | `entity/language/language.enum.ts` | Supported locales (`en`, `nl`, `fr`, `pt`) |
| `RouterStateUrl` | `entity/router-state/router-state-url.model.ts` | Shape produced by the router serializer |

## Rules

- **Types and interfaces only.** No services, no components, no Angular imports.
  Anything injectable belongs in the library that owns the behaviour.
- **`Language` is the single source of truth for locales.** The header dropdown and
  `readStoredLanguage()` both derive from `Object.values(Language)`, so adding a locale
  here propagates automatically — you only need to add the matching JSON bundle in
  `apps/genai-app/src/assets/i18n/`.

## Adding a model

Create `src/lib/entity/<domain>/<name>.model.ts` and re-export it from `src/index.ts`.
Keep one concept per file; the folder-per-domain layout is what keeps this readable as
it grows.
