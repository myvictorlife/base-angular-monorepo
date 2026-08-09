# translation (i18n)

Multi-language support using [ngx-translate](https://github.com/ngx-translate/core) v18
— signal-based, standalone providers only. `TranslateModule` no longer exists.

**Tag:** `scope:translate` — may depend on `scope:entity-lib` and `scope:environment-lib`.

## Supported languages

| Code | Language   | Bundle                                  |
| ---- | ---------- | --------------------------------------- |
| `en` | English    | `apps/demo-app/src/assets/i18n/en.json` |
| `nl` | Dutch      | `nl.json`                               |
| `fr` | French     | `fr.json`                               |
| `pt` | Portuguese | `pt.json`                               |

The list is driven by the `Language` enum in `@libs/entity`, not by this library.

## Setup

Register once in the application config, **after `provideHttpClient()`** — the loader
fetches `assets/i18n`:

```ts
import { provideTranslation } from '@libs/translation';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(), provideTranslation()],
};
```

`provideTranslation()` bundles four things:

1. **`provideTranslateService`** with the HTTP loader, restoring the language from
   `localStorage` (falling back to English).
2. **`failOnError: true`** on the loader — a missing bundle fails loudly instead of
   silently serving partial translations (v18 defaults to returning `{}` on 404).
3. **`provideDocumentLanguage()`** — keeps `<html lang>` in sync with the active
   language. Without it screen readers apply English pronunciation to every locale and
   crawlers index the page under the wrong one.
4. **`TranslatedTitleStrategy`** — treats each route's `title` as an i18n key, so
   `<title>` is translated instead of showing the raw key.

## Usage

**In templates** — import `TranslatePipe` in the component:

```ts
import { TranslatePipe } from '@ngx-translate/core';

@Component({ imports: [TranslatePipe], /* ... */ })
```

```html
{{ 'HOME.HERO_TITLE' | translate }}
```

**In components** — `currentLang` is a **signal**, so call it:

```ts
private readonly translate = inject(TranslateService);

this.translate.currentLang();      // reactive read
this.translate.getCurrentLang();   // non-reactive snapshot
this.translate.instant('PROFILE.TITLE');
```

**Route titles** — use a translation key:

```ts
{ path: 'profile', title: 'PROFILE.TITLE', loadChildren: ... }
```

**Changing language** — `UpdateLanguageService.changeLanguage(code)`, the
`lib-language-select` dropdown (`@libs/ui`) or the settings page. The choice is
persisted under `LANGUAGE_STORAGE_KEY` and restored on reload.
**No page reload is needed** — the swap is reactive.

## Testing components that translate

Nothing is hardcoded, so provide your own loader:

```ts
providers: [
  provideTranslateService({
    loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
    lang: 'en',
    fallbackLang: 'en',
  }),
];
```

> This is why the library no longer ships an NgModule. The old `TranslationLibModule`
> called `TranslateModule.forChild({ loader })`, and `forChild` quietly provided its
> **own `TranslateService`** bound to a non-overridable HTTP loader. In tests that
> request never resolved, so every label rendered as an empty string and no override
> could reach it.

## Adding a key

Add it to **every** bundle. `apps/demo-app/src/app/i18n-completeness.spec.ts`
fails on a missing key, an extra key, an empty value, or a missing bundle — so drift
is caught in CI rather than in production.

## Adding a language

1. Add the code to the `Language` enum in `@libs/entity`.
2. Add its entry to `LANGUAGE_METADATA` next to the enum — the endonym label
   (language pickers show each language in itself, never translated) and its
   text direction (`ltr`/`rtl`; `<html dir>` follows it automatically).
3. Create `apps/demo-app/src/assets/i18n/<code>.json` with the same keys as `en.json`.

Everything else — the `lib-language-select` dropdown, the settings radio group,
`readStoredLanguage()` — derives from the enum plus the metadata, so nothing else
needs an edit. The completeness spec fails until all three steps are done.

## Where translation is used

Header (nav + language switcher) · Home · Profile · User info · Update-language page ·
404 page · every route `<title>`.
