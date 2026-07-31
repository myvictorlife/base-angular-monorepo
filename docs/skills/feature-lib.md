# Skill: Creating a Feature Library

Use this guide every time you need to create a new feature library (e.g., `libs/orders`, `libs/settings`).
The reference implementation is `libs/profile`. Follow it exactly.

---

## 1. Generate the library

```sh
npx nx g @nx/angular:library libs/<feature-name> --tags=scope:<feature-name> --style=scss
```

Register the new path alias in `tsconfig.base.json`:

```json
"@libs/<feature-name>": ["libs/<feature-name>/src/index.ts"]
```

---

## 2. Required folder structure

```
libs/<feature-name>/
└── src/
    ├── index.ts                          ← public API (exports ONLY the routes)
    └── lib/
        ├── +state/
        │   ├── <feature-name>.store.ts        ← NgRx SignalStore
        │   └── <feature-name>.store.spec.ts
        ├── molecules/                         ← compound components
        │   └── <molecule-name>/
        │       ├── <molecule-name>.ts
        │       ├── <molecule-name>.html
        │       └── <molecule-name>.scss
        ├── pages/                             ← route-level components
        │   ├── <feature-name>/
        │   │   ├── <feature-name>.ts
        │   │   ├── <feature-name>.html
        │   │   └── <feature-name>.scss
        │   └── <feature-name>.routes.ts
        └── services/
            └── <feature-name>/
                └── <feature-name>.service.ts
```

---

## 3. index.ts — export only the routes

The `index.ts` is the **only public API** of the library.
**Never export components, services, or state from here** if this is a lazy-loaded feature.
Exporting a component would break lazy loading.

```typescript
// libs/<feature-name>/src/index.ts
export * from './lib/pages/<feature-name>.routes';
```

See `libs/profile/src/index.ts` — it exports only `profileRoutes`.

---

## 4. Routes file

Import the page component **directly** inside the routes file. This import stays inside the library boundary and does not break lazy loading, because the routes file itself is only loaded lazily from outside.

The route is also where the feature's state and services are provided, so they are
created when the feature is entered and destroyed when the user leaves.

```typescript
// libs/<feature-name>/src/lib/pages/<feature-name>.routes.ts
import { Routes } from '@angular/router';
import { FeatureStore } from '../+state/<feature-name>.store';
import { FeatureService } from '../services/<feature-name>/<feature-name>.service';
import { FeaturePage } from './<feature-name>/<feature-name>';

export const <featureName>Routes: Routes = [
  {
    path: '',
    providers: [FeatureStore, FeatureService],
    component: FeaturePage,
  },
];
```

---

## 5. Feature state — SignalStore

Each feature owns its state in a single `signalStore`. See
[`ngrx-state.md`](./ngrx-state.md) for the full pattern, including collections,
error handling and testing.

```typescript
// libs/<feature-name>/src/lib/+state/<feature-name>.store.ts
import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { FeatureService } from '../services/<feature-name>/<feature-name>.service';

export const FeatureStore = signalStore(
  withState({ data: null, loading: false, error: null }),
  withMethods((store, service = inject(FeatureService)) => ({
    fetch: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          service.fetch().pipe(
            tapResponse({
              next: (data) => patchState(store, { data, loading: false }),
              error: (error) => patchState(store, { error, loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);
```

**Do not** add a slice to the global Redux store — that store exists for router
state only.

---

## 6. Page component

The page component injects the store and reads its signals directly.

```typescript
// libs/<feature-name>/src/lib/pages/<feature-name>/<feature-name>.ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FeatureStore } from '../../+state/<feature-name>.store';

@Component({
  selector: 'lib-<feature-name>',
  imports: [],
  templateUrl: './<feature-name>.html',
  styleUrls: ['./<feature-name>.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturePage {
  private readonly store = inject(FeatureStore);

  readonly data = this.store.data;
  readonly loading = this.store.loading;
  readonly error = this.store.error;

  constructor() {
    this.store.fetch();
  }
}
```

---

## 7. Wire up lazy loading in the app

In the app's pages routes file, load the feature lazily:

```typescript
// apps/genai-app/src/app/pages/pages.routes.ts
{
  path: '<feature-name>',
  loadChildren: () =>
    import('@libs/<feature-name>').then((m) => m.<featureName>Routes),
}
```

**Do not** import the feature component or module directly here.
Only import the routes exported from the library's `index.ts`.

---

## 8. Checklist before finishing

- [ ] `index.ts` exports only the routes, not components or services
- [ ] Routes are registered as `loadChildren` in the app, not `component`
- [ ] State is a `signalStore`, not a slice of the global Redux store
- [ ] Store and service are listed in the route's `providers`, not in the component's
- [ ] Service is **not** `providedIn: 'root'`, so it stays in the lazy chunk
- [ ] The template renders loading, error and success — not just the happy path
- [ ] `tsconfig.base.json` has the `@libs/<feature-name>` path alias
- [ ] Library is tagged correctly in `project.json`
