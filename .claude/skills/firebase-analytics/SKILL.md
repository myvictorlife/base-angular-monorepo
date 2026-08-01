---
name: firebase-analytics
description: Log analytics events through the vendor-neutral ANALYTICS token. Use when adding tracking to a component or service, when wiring an analytics implementation in app.config.ts, or when replacing or removing Firebase analytics.
---

# Skill: Analytics

Analytics is **opt-in and vendor-neutral**. Call sites depend on the `ANALYTICS`
token; the app decides once, in `app.config.ts`, what sits behind it.

With no implementation registered, `ANALYTICS` resolves to `NoopAnalytics`, so a
fresh clone runs with no Firebase project, no SDK in the bundle and no `if
(analytics)` guards anywhere.

---

## How it works

```
libs/shared/analytics             ← the contract. Depends on nothing.
  ANALYTICS  (InjectionToken, factory default → NoopAnalytics)
  Analytics  (interface: initialize / logEvent / logPageView)
        ▲
        │ implements
libs/shared/analytics-firebase    ← the only project that names Firebase
  FirebaseAnalytics               (dynamic import of the SDK, never static)
  provideFirebaseAnalytics()

apps/demo-app/src/app/app.config.ts
  provideFirebaseAnalytics()      ← one line: the whole coupling
  provideAppInitializer(...)      ← initialize() + logPageView on NavigationEnd
```

Page views fire automatically on every `NavigationEnd`, with the translated
document title, so no route needs to log anything itself.

---

## 1. The `Analytics` contract

**Location:** `libs/shared/analytics/src/lib/analytics.ts`

| Method          | Signature                                                     | Description                                                          |
| --------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `initialize()`  | `(): Promise<void>`                                           | Called once by the app initializer. Must resolve even when disabled. |
| `logEvent()`    | `(eventName: string, params?: Record<string, unknown>): void` | Logs a custom event.                                                 |
| `logPageView()` | `(pagePath: string, pageTitle?: string): void`                | Logs a `page_view`. Called automatically on route changes.           |

---

## 2. Logging custom events

Inject the **token**, never a concrete implementation:

```typescript
import { Component, inject } from '@angular/core';
import { ANALYTICS } from '@libs/analytics';

export class CheckoutPage {
  private readonly analytics = inject(ANALYTICS);

  onPurchase(itemId: string): void {
    this.analytics.logEvent('purchase', { item_id: itemId, currency: 'USD' });
  }
}
```

`@libs/analytics` is a leaf library — any project may depend on it. Importing
`@libs/analytics-firebase` outside the app is a lint error, by design: choosing a
vendor is a composition decision.

Event names follow the [GA4 convention](https://support.google.com/analytics/answer/9267735):
snake_case (`user_signed_up`, `file_downloaded`), no spaces or special characters.

---

## 3. Why call sites need no guards

Every layer degrades to inert rather than throwing:

| Situation                                      | What happens                                                                        |
| ---------------------------------------------- | ----------------------------------------------------------------------------------- |
| No provider registered                         | `ANALYTICS` → `NoopAnalytics`; methods do nothing                                   |
| Provider registered, no `config/firebase.json` | `firebaseEnabled` is `false`; `initialize()` returns before importing the SDK       |
| Configured, but analytics unsupported          | `isSupported()` is false (ad blocker, web worker, cookies off); stays uninitialized |
| Event fired before `initialize()` resolves     | Dropped, by design — the initializer does not await it                              |

So `logEvent()` is always safe to call. No try/catch, no null checks.

---

## 4. Turning Firebase on

Drop your config into `config/firebase.json` (see the `firebase-deploy` skill) and
keep `provideFirebaseAnalytics()` in `app.config.ts`. `measurementId` is what makes
analytics work — without it the SDK initializes but reports nothing.

The SDK is loaded with a **dynamic** `import()`, so it is fetched only where
analytics is actually enabled. Never convert those to static imports: a static
`import { getAnalytics } from 'firebase/analytics'` pulls ~25 kB into the bundle
even when `firebaseEnabled` is `false`.

`FirebaseAnalytics.initialize()` calls `initializeApp()` only when `getApps()` is
empty, so adding Firestore or Auth later will not produce a duplicate-app error.

---

## 5. Replacing or removing the vendor

**Removing Firebase entirely** — three deletions, no call-site changes:

1. Delete `provideFirebaseAnalytics()` from `app.config.ts`
2. Delete `libs/shared/analytics-firebase/`
3. Drop `firebase` from `package.json`

**Swapping in another vendor** — mirror `analytics-firebase`:

```typescript
// libs/shared/analytics-plausible/src/lib/plausible-analytics.providers.ts
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ANALYTICS } from '@libs/analytics';
import { PlausibleAnalytics } from './plausible-analytics';

export function providePlausibleAnalytics(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ANALYTICS, useClass: PlausibleAnalytics },
  ]);
}
```

Tag it `scope:analytics-<vendor>-lib`, give it a `depConstraints` entry allowing
only `scope:analytics-lib` and `scope:environment-lib`, and add that tag to
`scope:demo-app`. See the `module-boundaries` skill.

---

## 6. Testing

Override the token — that is what it is for:

```typescript
const analytics = {
  logEvent: jest.fn(),
  logPageView: jest.fn(),
  initialize: jest.fn(),
};

TestBed.configureTestingModule({
  providers: [{ provide: ANALYTICS, useValue: analytics }],
});

expect(analytics.logEvent).toHaveBeenCalledWith('purchase', {
  item_id: '1',
  currency: 'USD',
});
```

Tests never need a Firebase project. `libs/shared/analytics-firebase` mocks
`firebase/analytics` and `firebase/app` outright.

---

## 7. A second app in the monorepo

Add the same two pieces to its `app.config.ts`:

```typescript
import { inject, provideAppInitializer } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ANALYTICS } from '@libs/analytics';
import { provideFirebaseAnalytics } from '@libs/analytics-firebase';
import { filter } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideFirebaseAnalytics(),

    provideAppInitializer(() => {
      const analytics = inject(ANALYTICS);
      const router = inject(Router);
      const title = inject(Title);

      // Not awaited: the initializer gates first paint, and this is observational.
      void analytics.initialize();

      router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((e) =>
          analytics.logPageView(
            (e as NavigationEnd).urlAfterRedirects,
            title.getTitle(),
          ),
        );
    }),
  ],
};
```

---

## Checklist

- [ ] Call sites inject `ANALYTICS` from `@libs/analytics`, never `FirebaseAnalytics`
- [ ] No library outside the app imports `@libs/analytics-firebase`
- [ ] The Firebase SDK is reached only through `import()`, never a static import
- [ ] Custom event names are snake_case
- [ ] `logEvent()` is called from user actions, not constructors or initializers
- [ ] `initialize()` is called once, from `app.config.ts`
- [ ] `measurementId` is present in `config/firebase.json` if events should reach GA4
