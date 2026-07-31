# ui

Reusable presentational components plus the app-wide cross-cutting concerns that need
to reach Analytics.

**Tag:** `scope:ui-lib` — may depend on `scope:entity-lib`, `scope:environment-lib`
and `scope:translate`. It must **not** depend on a feature library; features depend on
`ui`, never the reverse.

## Import

```ts
import {
  HeaderComponent,
  AnalyticsService,
  GlobalErrorHandler,
  httpErrorInterceptor,
} from '@libs/ui';
```

## Contents

### `HeaderComponent` (`lib-header`)

Site header: brand, nav, language switcher and mobile menu.

It reads the active language straight off ngx-translate's `currentLang` signal — it
does **not** keep a local copy. Mirroring that state with an `effect` + subscription is
what this component used to do; the signal made ~10 lines disappear.

The language list is derived from `Object.values(Language)`, so adding a locale to the
enum makes it appear here with no edit — only `LANGUAGE_LABEL_KEYS` needs the new i18n
key, and it falls back to `LANGUAGE.<CODE>` if you forget.

### `AnalyticsService`

Firebase Analytics wrapper. Every method no-ops while `environment.firebaseEnabled` is
`false`, so the app runs without Firebase configured and tests need no mock.

```ts
analytics.logEvent('some_event', { detail: 'value' });
analytics.logPageView('/profile', 'Profile · Base App');
```

### `GlobalErrorHandler`

`ErrorHandler` that reports uncaught errors to Analytics as `app_exception`, then
delegates to Angular's default handler so local debugging is unchanged. Registered in
`app.config.ts`:

```ts
{ provide: ErrorHandler, useClass: GlobalErrorHandler }
```

### `httpErrorInterceptor`

Logs failed requests as `http_error` and **re-throws**. It is a reporting point, not a
handler: callers keep control of user-facing behaviour (the profile store maps the
failure into its own `error` state). `status: 0` means the request never reached the
server — offline, CORS, or blocked.

```ts
provideHttpClient(withInterceptors([httpErrorInterceptor]))
```

## Rules

- **Presentational only** for components: inputs in, outputs out, no HTTP, no feature
  state. Anything that fetches belongs in the feature that owns it.
- `ChangeDetectionStrategy.OnPush` is mandatory (enforced by lint since angular-eslint 22).
- Import only the pipes/directives a template uses — `TranslatePipe`, `RouterLink`,
  `UpperCasePipe` — never `CommonModule`.
- Prefix is `lib` (`lib-header`), set in `eslint.config.mjs`.

## Assets

The header logo is an **inline SVG**, not a remote image. Nothing in this library may
reference a third-party domain — the app ships with zero external origins, and the
self-hosted fonts in `apps/genai-app/public/fonts` exist for the same reason.
