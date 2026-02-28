# Skill: Firebase Analytics

Firebase Analytics is pre-configured in this template and tracks page views automatically on every route change.
No setup is needed beyond filling in the `firebaseConfig` credentials (see `docs/skills/firebase-deploy.md`).

---

## How it works

```
app.config.ts (provideAppInitializer)
  └── AnalyticsService.initialize()   ← checks browser support, initializes Firebase app
        └── router.events (NavigationEnd)
              └── analytics.logPageView(url)  ← fires on every route change
```

**`AnalyticsService`** lives in `libs/shared/ui` and is `providedIn: 'root'`, so it is available anywhere in the app without extra configuration.

---

## 1. AnalyticsService API

**Location:** `libs/shared/ui/src/lib/services/analytics/analytics.service.ts`

| Method | Signature | Description |
|---|---|---|
| `initialize()` | `async (): Promise<void>` | Initializes Firebase Analytics. Safe to call multiple times. |
| `logPageView()` | `(pagePath: string, pageTitle?: string): void` | Logs a `page_view` event. Called automatically on route changes. |
| `logEvent()` | `(eventName: string, params?: Record<string, unknown>): void` | Logs any custom event. |

---

## 2. Logging custom events

Import and inject `AnalyticsService` anywhere in the app or libs:

```typescript
import { Component, inject } from '@angular/core';
import { AnalyticsService } from '@libs/ui';

export class CheckoutPage {
  private readonly analytics = inject(AnalyticsService);

  onPurchase(itemId: string) {
    this.analytics.logEvent('purchase', { item_id: itemId, currency: 'USD' });
  }
}
```

Use descriptive event names following the [GA4 event naming convention](https://support.google.com/analytics/answer/9267735):
- Snake case: `user_signed_up`, `file_downloaded`, `form_submitted`
- Avoid spaces and special characters

---

## 3. Browser support guard

`initialize()` calls `isSupported()` from the Firebase SDK before doing anything.
If Analytics is not supported (e.g., blocked by an ad blocker, running in a web worker, or missing `measurementId`), initialization is silently skipped.
All subsequent `logEvent()` calls also check for a valid Analytics instance and are no-ops if initialization was skipped.

**No error handling is needed in call sites** — the service handles unsupported environments internally.

---

## 4. Firebase app initialization

The service calls `initializeApp(environment.firebaseConfig)` only if no Firebase app has been initialized yet (`getApps().length === 0`). This prevents duplicate app errors when the initializer runs more than once.

If another part of the app also initializes Firebase (e.g., Firestore, Auth), the `getApps()` check ensures only one app instance is created.

---

## 5. Adding Analytics to a new app in the monorepo

If a second app is added to `apps/`, add the same `provideAppInitializer` block to its `app.config.ts`:

```typescript
// apps/<new-app>/src/app/app.config.ts
import { inject, provideAppInitializer } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AnalyticsService } from '@libs/ui';
import { filter } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... other providers

    provideAppInitializer(async () => {
      const analytics = inject(AnalyticsService);
      const router = inject(Router);

      await analytics.initialize();

      router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((e) => {
          analytics.logPageView((e as NavigationEnd).urlAfterRedirects);
        });
    }),
  ],
};
```

---

## Checklist

- [ ] `firebaseConfig.measurementId` is set in environment files (required for Analytics — starts with `G-`)
- [ ] `firebaseConfig.appId` is set in environment files (required to initialize the Firebase app)
- [ ] Custom events use snake_case names
- [ ] `logEvent()` is called after user actions, not inside constructors or initializers
- [ ] No manual `initialize()` calls outside of `app.config.ts` — initialization happens once at app startup
