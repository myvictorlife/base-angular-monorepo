# profile

Profile feature library. **This is the reference implementation** for a feature lib —
copy its shape when adding a new one. See
[`docs/skills/feature-lib.md`](../../docs/skills/feature-lib.md).

**Tag:** `scope:profile` — may depend on `scope:entity-lib` and `scope:environment-lib`.

## Import

```ts
import { profileRoutes, ProfileStore } from '@libs/profile';
```

The app lazy-loads it:

```ts
{ path: 'profile', loadChildren: () => import('@libs/profile').then(m => m.profileRoutes) }
```

## Structure

```
src/lib/
├── +state/profile.store.ts        # signalStore: state, computed, methods
├── molecules/user-info/           # presentational card (Atomic Design)
├── pages/
│   ├── profile/                   # route-level component
│   └── user.routes.ts             # provides ProfileStore + ProfileService
└── services/profile/              # HTTP boundary
```

## State — `ProfileStore`

A `signalStore` from `@ngrx/signals`. No actions, no reducers, no effects, no selectors.

| Member | Kind | |
|---|---|---|
| `profile` | state | `User \| null` |
| `loading` | state | `boolean` |
| `error` | state | `IGenericError \| null` |
| `hasProfile` | computed | `profile() !== null` |
| `errorMessage` | computed | `error()?.message ?? null` |
| `fetchProfile()` | rxMethod | loads the profile; safe to call repeatedly |

Everything is a signal, so components read it directly — no `select`, no `async` pipe,
nothing to unsubscribe:

```ts
private readonly store = inject(ProfileStore);
readonly profile = this.store.profile;
readonly loading = this.store.loading;
```

### Two decisions worth keeping

**The store is provided on the route, not in root:**

```ts
// user.routes.ts
{ path: '', providers: [ProfileStore, ProfileService], component: Profile }
```

It is created when the feature is entered and torn down when it is left. Providing it
in a component's `imports` array (the old NgModule habit) couples the component to its
own state registration and makes it untestable in isolation.

**`fetchProfile` uses `switchMap` + `tapResponse`:**
- `switchMap` cancels an in-flight request when a newer one starts, so a slow response
  can never overwrite a fresher one.
- `tapResponse` keeps the stream alive after a failure. Without it the first error
  completes the `rxMethod` and **every later call is silently ignored** — which is
  exactly what breaks a retry button.

## Service

`ProfileService.fetchProfile()` currently returns a stubbed `of({...})`. To hit a real
backend, use `environment.baseUrl` + `commonPaths.profile.fetchProfile` from
`@libs/environment` — the doc comment on the method spells it out.

## Testing

The route provides the store, so a component-level test must register it explicitly:

```ts
providers: [
  { provide: ProfileService, useValue: profileServiceStub },
  ProfileStore,
  provideTranslateService({ loader: [...], lang: 'en', fallbackLang: 'en' }),
]
```

No root store and no effects runner — that is the point of the SignalStore pattern.
`profile.spec.ts` covers the loading, error and retry paths.
