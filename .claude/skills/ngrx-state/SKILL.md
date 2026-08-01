---
name: ngrx-state
description: Feature state with NgRx SignalStore — withState, withComputed, withMethods, withHooks, rxMethod, and providing the store on its route. Use when adding state to a feature, writing or changing a store, or migrating off the classic NgRx Store.
---

# Skill: Feature State with NgRx SignalStore

Every feature library that needs state management follows this pattern.
The reference implementation is `libs/profile/src/lib/+state/profile.store.ts`.

---

## Which store do I use?

| State                                         | Tool                                | Where                                                                     |
| --------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------- |
| Feature state (a page's data, loading, error) | **`signalStore`** — `@ngrx/signals` | `libs/<feature>/src/lib/+state/<feature>.store.ts`, provided on the route |
| Local UI state (a dropdown, a filter)         | `signal()` in the component         | the component itself                                                      |
| Router state (URL, params, query params)      | `@ngrx/router-store`                | `provideRouterStore()` in `app.config.ts`                                 |
| Cross-feature events                          | `@ngrx/signals/events`              | see _Cross-feature events_ below                                          |

**The global Redux store exists for router state only.** Do not add feature slices
to it. `provideStore()` in `app.config.ts` registers `routerReducer` and nothing
else — if you find yourself calling `provideState()`, you want a SignalStore instead.

---

## Folder structure

```
+state/
├── <feature>.store.ts
└── <feature>.store.spec.ts
```

One file per store. There are no separate actions/reducer/selectors/effects files —
`withState`, `withComputed` and `withMethods` cover all four roles.

---

## 1. The store

```typescript
// libs/<feature>/src/lib/+state/<feature>.store.ts
import { computed, inject } from '@angular/core';
import { IGenericError, User } from '@libs/entity';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { FeatureService } from '../services/<feature>/<feature>.service';

export interface FeatureState {
  profile: User | null;
  loading: boolean;
  error: IGenericError | null;
}

export const initialFeatureState: FeatureState = {
  profile: null,
  loading: false,
  error: null,
};

export const FeatureStore = signalStore(
  withState(initialFeatureState),
  withComputed(({ profile, error }) => ({
    hasProfile: computed(() => profile() !== null),
    errorMessage: computed(() => error()?.message ?? null),
  })),
  withMethods((store, service = inject(FeatureService)) => ({
    fetchProfile: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          service.fetchProfile().pipe(
            tapResponse({
              next: (profile) => patchState(store, { profile, loading: false }),
              error: (error: IGenericError) =>
                patchState(store, { error, loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);
```

**Rules:**

- `withState` for raw data, `withComputed` for anything derived. Never store a value
  you can derive — that is the SignalStore equivalent of a duplicated selector.
- Always reset `loading` and `error` when a request starts.
- **`tapResponse` is not optional.** A pipe without error handling dies on the first
  failure and every later call is silently ignored. `tapResponse` keeps the
  `rxMethod` alive so a retry works.
- Use a plain state field for a single object. `withEntities` (`@ngrx/signals/entities`)
  is for **collections** — reaching for it to hold one item only adds indirection.

**When to use each flattening operator inside `rxMethod`:**

| Operator     | Use case                                                                                       |
| ------------ | ---------------------------------------------------------------------------------------------- |
| `switchMap`  | Data fetching — cancels the previous request so a slow response cannot overwrite a fresher one |
| `exhaustMap` | User actions (form submit) — ignores new calls while one is in flight                          |
| `concatMap`  | Ordered queue — processes calls one at a time                                                  |
| `mergeMap`   | Parallel — runs all concurrently (use rarely)                                                  |

---

## 2. Collections — `withEntities`

When the feature holds a list, use the entity feature instead of a plain array:

```typescript
import { setAllEntities, withEntities } from '@ngrx/signals/entities';

export const OrdersStore = signalStore(
  withEntities<Order>(),
  withState({ loading: false }),
  withMethods((store, service = inject(OrderService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true })),
        switchMap(() =>
          service.list().pipe(
            tapResponse({
              next: (orders) =>
                patchState(store, setAllEntities(orders), { loading: false }),
              error: () => patchState(store, { loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);
// store.entities() -> Signal<Order[]>, plus store.entityMap() and store.ids()
```

Use `setEntity`/`upsertEntity` to write a single item — **not** `addEntity`, which is
a no-op when the id already exists and will silently drop a refreshed record.

---

## 3. Providing the store

The store is provided on the **route**, together with the services it injects:

```typescript
// libs/<feature>/src/lib/pages/<feature>.routes.ts
import { Routes } from '@angular/router';
import { FeatureStore } from '../+state/<feature>.store';
import { FeatureService } from '../services/<feature>/<feature>.service';
import { FeaturePage } from './<feature>/<feature>';

export const featureRoutes: Routes = [
  {
    path: '',
    providers: [FeatureStore, FeatureService],
    component: FeaturePage,
  },
];
```

**Never** `signalStore({ providedIn: 'root' })` for feature state, and never put the
store in a component's `providers` — route-level providers create it when the feature
is entered, destroy it when the user leaves, and keep the component testable.

---

## 4. Consuming state in a component

The store's members are already signals. Read them directly — no selector layer,
nothing to unsubscribe from.

```typescript
@Component({
  selector: 'lib-<feature>',
  imports: [TranslatePipe],
  templateUrl: './<feature>.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturePage {
  private readonly store = inject(FeatureStore);

  readonly profile = this.store.profile;
  readonly loading = this.store.loading;
  readonly errorMessage = this.store.errorMessage;

  constructor() {
    this.store.fetchProfile();
  }
}
```

**Always render all three states.** A store that tracks `loading` and `error` whose
template only renders the happy path is worse than not tracking them at all:

```html
@if (loading()) {
<p role="status" aria-live="polite">{{ 'FEATURE.LOADING' | translate }}</p>
} @else if (errorMessage(); as message) {
<div role="alert">
  <p>{{ 'FEATURE.ERROR' | translate }}</p>
  <p>{{ message }}</p>
  <button type="button" (click)="reload()">
    {{ 'FEATURE.RETRY' | translate }}
  </button>
</div>
} @else if (profile(); as data) {
<lib-user-info [user]="data" />
}
```

---

## 5. Testing

A store test is plain `TestBed` — no `provideStore`, no effects runner, no marbles.

```typescript
const setup = () => {
  service = { fetchProfile: jest.fn().mockReturnValue(of(user)) };
  TestBed.configureTestingModule({
    providers: [FeatureStore, { provide: FeatureService, useValue: service }],
  });
  return TestBed.inject(FeatureStore);
};

it('stores the profile on a successful fetch', () => {
  const store = setup();
  store.fetchProfile();
  expect(store.profile()).toEqual(user);
});
```

Cover, at minimum: the initial state, success, failure, `loading` while in flight
(return a `Subject` from the stub instead of `of()`), and that a retry works after a
failure. To write state from a test — only when setting up a scenario you cannot
reach through a method — use `unprotected` from `@ngrx/signals/testing`.

---

## Cross-feature events

When one feature has to react to something that happened in another, do **not** reach
into the other store. Use the events plugin, which gives back the Redux-style
one-way flow without the file sprawl:

```typescript
import { type } from '@ngrx/signals';
import { eventGroup, injectDispatch, on, withReducer } from '@ngrx/signals/events';

export const profileEvents = eventGroup({
  source: 'Profile Page',
  events: { loaded: type<User>() },
});

// in a store that cares:
withReducer(on(profileEvents.loaded, ({ payload }) => ({ currentUser: payload })));

// in a component that publishes:
readonly dispatch = injectDispatch(profileEvents);
```

Reach for this only when there is a real cross-feature consumer. For a single
feature, `withMethods` is the simpler and correct answer.

---

## Migrating an old slice

If you find `createAction`/`createReducer`/`createEffect` files in a feature lib,
they predate this pattern. Replace the whole `+state/<feature>/` folder with one
`<feature>.store.ts`:

| Old                               | New                                                       |
| --------------------------------- | --------------------------------------------------------- |
| `createAction` + `props`          | a method on `withMethods` (or an event, if cross-feature) |
| `createReducer` + `on`            | `patchState` inside the method                            |
| `createSelector`                  | `withComputed`                                            |
| `createEffect` + `ofType`         | `rxMethod` with the same RxJS pipe                        |
| `createEntityAdapter`             | `withEntities` from `@ngrx/signals/entities`              |
| `provideState` + `provideEffects` | the store class in the route's `providers`                |
