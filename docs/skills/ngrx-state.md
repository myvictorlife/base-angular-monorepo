# Skill: NgRx State Slice Pattern

Every feature library that needs state management follows this pattern.
The reference implementation is `libs/profile/src/lib/+state/profile/`.

---

## Folder structure

```
+state/
└── <feature>/
    ├── <feature>.actions.ts
    ├── <feature>.effects.ts
    ├── <feature>.module.ts
    ├── <feature>.reducer.ts
    └── <feature>.selectors.ts
```

---

## 1. Actions

Use `createAction` with `props<>()` for payloads. Follow the naming convention `[FEATURE] Event Name`.

```typescript
// <feature>.actions.ts
import { createAction, props } from '@ngrx/store';
import { User, IGenericError } from '@libs/entity';

export const fetchProfile = createAction('[PROFILE] Fetch Profile');

export const fetchProfileSuccess = createAction(
  '[PROFILE] Fetch Profile Success',
  props<{ response: User }>()
);

export const fetchProfileFailed = createAction(
  '[PROFILE] Fetch Profile Failed',
  props<{ error: IGenericError }>()
);
```

**Convention:**
- Trigger action: `[FEATURE] Verb Noun`
- Success: `[FEATURE] Verb Noun Success`
- Failure: `[FEATURE] Verb Noun Failed`

---

## 2. Reducer

Use `@ngrx/entity` adapter when managing collections. Use `createReducer` + `on()`.

```typescript
// <feature>.reducer.ts
import { IGenericError, User } from '@libs/entity';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as fromActions from './<feature>.actions';

export const <feature>FeatureKey = '<feature>';

export interface State extends EntityState<User> {
  loading: boolean;
  error: IGenericError | null;
}

export const adapter: EntityAdapter<User> = createEntityAdapter<User>({
  selectId: (user) => user.id,
});

export const initialState: State = adapter.getInitialState({
  loading: false,
  error: null,
});

export const reducer = createReducer(
  initialState,
  on(fromActions.fetch<Feature>, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(fromActions.fetch<Feature>Success, (state, { response }) =>
    adapter.addOne(response, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(fromActions.fetch<Feature>Failed, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);

export const { selectAll } = adapter.getSelectors();
```

**Rules:**
- Always reset `loading` and `error` on each transition
- Use the entity adapter for collections; use plain state fields for single objects
- Import actions via `* as fromActions` to avoid naming collisions

---

## 3. Selectors

Always start from a feature selector. Compose derived selectors with `createSelector`.

```typescript
// <feature>.selectors.ts
import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromReducer from './<feature>.reducer';

export const select<Feature>State = createFeatureSelector<fromReducer.State>(
  fromReducer.<feature>FeatureKey
);

export const selectLoading = createSelector(
  select<Feature>State,
  (state) => state?.loading ?? false
);

export const select<Feature>List = createSelector(
  select<Feature>State,
  fromReducer.selectAll
);

// Convenience selector for a single item
export const select<Feature> = createSelector(
  select<Feature>List,
  (list) => list?.[0] ?? null
);
```

---

## 4. Effects

Use `createEffect` + `ofType` + `switchMap` (or `exhaustMap` for user-initiated actions).

```typescript
// <feature>.effects.ts
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { <Feature>Service } from '../../services/<feature>/<feature>.service';
import * as fromActions from './<feature>.actions';

@Injectable()
export class <Feature>Effects {
  private readonly actions$ = inject(Actions);
  private readonly <feature>Service = inject(<Feature>Service);

  fetch<Feature>$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.fetch<Feature>),
      switchMap(() =>
        this.<feature>Service.fetch<Feature>().pipe(
          map((response) => fromActions.fetch<Feature>Success({ response })),
          catchError((error) => of(fromActions.fetch<Feature>Failed({ error })))
        )
      )
    )
  );
}
```

**When to use each flattening operator:**
| Operator | Use case |
|---|---|
| `switchMap` | Data fetching — cancels previous request if action fires again |
| `exhaustMap` | User actions (form submit) — ignores new actions while in-flight |
| `concatMap` | Ordered queue — processes actions one at a time |
| `mergeMap` | Parallel — runs all concurrently (use rarely) |

---

## 5. State Module

Register the feature store and effects in a dedicated `NgModule` imported by the page component.

```typescript
// <feature>.module.ts
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { <Feature>Service } from '../../services/<feature>/<feature>.service';
import * as fromReducer from './<feature>.reducer';
import { <Feature>Effects } from './<feature>.effects';

@NgModule({
  imports: [
    StoreModule.forFeature(fromReducer.<feature>FeatureKey, fromReducer.reducer),
    EffectsModule.forFeature([<Feature>Effects]),
  ],
  providers: [<Feature>Service],
})
export class <Feature>StateModule {}
```

**Important:**
- Always use `forFeature`, never `forRoot` inside a lib
- `forRoot` is used only once in `app.config.ts`
- Provide the service here, not with `providedIn: 'root'`, so it stays in the lazy chunk

---

## 6. Consuming state in a component

Use `store.selectSignal()` for reactive reads. Dispatch in the constructor, not in `ngOnInit`.

```typescript
@Component({
  selector: 'lib-<feature>',
  imports: [<Feature>StateModule],
  templateUrl: './<feature>.html',
})
export class <Feature>Page {
  private readonly store = inject(Store);

  data = this.store.selectSignal(select<Feature>);
  loading = this.store.selectSignal(selectLoading);

  constructor() {
    this.store.dispatch(fetch<Feature>());
  }
}
```

---

## Shared state vs Feature state

| State | Location | Registration |
|---|---|---|
| Cross-feature data (e.g., logged-in user) | `libs/shared/store` | `SharedDataStateModule` in `app.config.ts` |
| Feature-specific data | `libs/<feature>/+state` | `<Feature>StateModule` imported by the page component |
