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
        │   └── <feature-name>/
        │       ├── <feature-name>.actions.ts
        │       ├── <feature-name>.effects.ts
        │       ├── <feature-name>.module.ts   ← NgRx StoreModule + EffectsModule
        │       ├── <feature-name>.reducer.ts
        │       └── <feature-name>.selectors.ts
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

```typescript
// libs/<feature-name>/src/lib/pages/<feature-name>.routes.ts
import { Routes } from '@angular/router';
import { FeaturePage } from './<feature-name>/<feature-name>';

export const <featureName>Routes: Routes = [
  {
    path: '',
    component: FeaturePage,
  },
];
```

---

## 5. NgRx State Module

Each feature manages its own store slice via a dedicated `NgModule`.

```typescript
// libs/<feature-name>/src/lib/+state/<feature-name>/<feature-name>.module.ts
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { FeatureService } from '../../services/<feature-name>/<feature-name>.service';
import * as fromReducer from './<feature-name>.reducer';
import { FeatureEffects } from './<feature-name>.effects';

@NgModule({
  imports: [
    StoreModule.forFeature(fromReducer.<featureName>FeatureKey, fromReducer.reducer),
    EffectsModule.forFeature([FeatureEffects]),
  ],
  providers: [FeatureService],
})
export class FeatureStateModule {}
```

---

## 6. Page component

The page component imports the state module and dispatches actions in the constructor.

```typescript
// libs/<feature-name>/src/lib/pages/<feature-name>/<feature-name>.ts
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { FeatureStateModule } from '../../+state/<feature-name>/<feature-name>.module';
import { fetchFeature } from '../../+state/<feature-name>/<feature-name>.actions';
import { selectFeatureData } from '../../+state/<feature-name>/<feature-name>.selectors';

@Component({
  selector: 'lib-<feature-name>',
  imports: [FeatureStateModule],
  templateUrl: './<feature-name>.html',
  styleUrls: ['./<feature-name>.scss'],
})
export class FeaturePage {
  private readonly store = inject(Store);

  data = this.store.selectSignal(selectFeatureData);

  constructor() {
    this.store.dispatch(fetchFeature());
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
- [ ] State module uses `StoreModule.forFeature` (not `forRoot`)
- [ ] Page component imports the state module in its `imports` array
- [ ] `tsconfig.base.json` has the `@libs/<feature-name>` path alias
- [ ] Library is tagged correctly in `project.json`
- [ ] Service is provided via the state `NgModule`, not `providedIn: 'root'`
