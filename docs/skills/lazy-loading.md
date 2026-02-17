# Skill: Lazy Loading Rules

Lazy loading is a critical performance pattern in this project. Violating these rules makes lazy loading ineffective — the module gets bundled eagerly, defeating the purpose entirely.

---

## The Core Rule

> A feature library is lazy-loaded only if **nothing from it is imported statically** outside its own boundary.

The moment you add a direct `import` of a component or service from a feature lib into the app bundle (outside a dynamic `import()`), the entire lib gets included in the initial bundle.

---

## What the `index.ts` must export

Each lazy-loaded feature lib's `index.ts` exports **only the routes**:

```typescript
// libs/profile/src/index.ts  ← CORRECT
export * from './lib/pages/user.routes';
```

**Never do this** if the lib is lazy-loaded:

```typescript
// WRONG — exporting a component breaks lazy loading
export * from './lib/pages/profile/profile';
export * from './lib/services/profile/profile.service';
export * from './lib/+state/profile/profile.module';
```

If the app imports `Profile` component or `ProfileStateModule` statically at the top of a file, Angular's bundler sees the dependency and includes it in the initial chunk.

---

## How to load a feature in the app

Use `loadChildren` with a dynamic `import()`:

```typescript
// apps/genai-app/src/app/pages/pages.routes.ts  ← CORRECT
{
  path: 'profile',
  loadChildren: () =>
    import('@libs/profile').then((m) => m.profileRoutes),
}
```

**Never use `component` or `loadComponent` pointing to a lib page component:**

```typescript
// WRONG — static import of a feature page component
import { Profile } from '@libs/profile';

{
  path: 'profile',
  component: Profile,  // ← breaks lazy loading
}
```

---

## Internal imports are fine

Inside the feature lib, components can import each other freely. These imports stay within the lazy chunk:

```typescript
// libs/profile/src/lib/pages/profile/profile.ts — CORRECT
// This import is internal to the lib; it stays in the lazy chunk
import { UserInfoComponent } from '../../molecules/user-info/user-info';
import { ProfileStateModule } from '../../+state/profile/profile.module';
```

The rule only applies to imports **from outside the lib boundary** (i.e., from the app or other libs).

---

## Shared libs are always eager

`libs/shared/*` (entity, ui, store, environment) are shared across the app and are part of the main bundle. They do not need lazy loading. Importing from them anywhere is fine:

```typescript
import { User } from '@libs/entity';    // always eager — correct
import { HeaderComponent } from '@libs/ui';  // always eager — correct
```

---

## How to verify lazy loading is working

After building the app:

```sh
npx nx build genai-app --stats-json
```

Inspect the output chunks. The feature lib should appear as a separate chunk file (e.g., `libs_profile_src_index_ts.js`), not merged into `main.js`.

---

## Summary table

| Scenario | Correct? |
|---|---|
| `loadChildren` with dynamic `import('@libs/profile')` | Yes |
| `index.ts` exports only routes | Yes |
| Internal lib imports between components/state/service | Yes |
| `component: Profile` in app routes with static import | No |
| `index.ts` exports a component or service | No (unless the lib is intentionally eager) |
| App file has `import { Profile } from '@libs/profile'` | No |
