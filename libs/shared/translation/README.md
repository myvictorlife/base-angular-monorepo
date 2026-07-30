# Translation (i18n)

Multi-language support for the project using [ngx-translate](https://github.com/ngx-translate/core) v18 (signal-based, standalone providers only — `TranslateModule` no longer exists).

## Supported languages

- **en** – English  
- **nl** – Dutch  
- **fr** – French  

## Setup

Register once in the application config, after `provideHttpClient()` (the i18n loader fetches `assets/i18n`):

```ts
import { provideTranslation } from '@libs/translation';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideTranslation(),
  ],
};
```

`provideTranslation()` reads the stored language from `localStorage` and falls back to English.

## Usage

1. **In templates:** import `TranslatePipe` in the component and use the pipe:

   ```ts
   import { TranslatePipe } from '@ngx-translate/core';

   @Component({ imports: [TranslatePipe], /* ... */ })
   ```

   ```html
   {{ 'HOME.HERO_TITLE' | translate }}
   ```

2. **In components:** inject `TranslateService`. `currentLang` is a **signal** — call it:

   ```ts
   private readonly translate = inject(TranslateService);
   this.translate.currentLang();          // reactive read
   this.translate.getCurrentLang();       // non-reactive snapshot
   this.translate.instant('PROFILE.TITLE');
   ```

3. **Changing language:** use `UpdateLanguageService.changeLanguage(code)` or the header dropdown. The choice is stored in `localStorage` under `LANGUAGE_STORAGE_KEY` and reused on reload. No page reload is needed — the swap is reactive.

## Testing components that translate

Provide your own loader; nothing is hardcoded:

```ts
providers: [
  provideTranslateService({
    loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
    lang: 'en',
    fallbackLang: 'en',
  }),
]
```

## Adding new keys

Edit the JSON files under **`apps/genai-app/src/assets/i18n/`** (`en.json`, `nl.json`, `fr.json`). Use the same key in all files (e.g. `"MY_SECTION.MY_KEY": "Text"`).

The loader runs with `failOnError: true`, so a missing i18n file fails loudly instead of silently serving partial translations.

## Adding a new language

1. Add a new file in `apps/genai-app/src/assets/i18n/`, e.g. `de.json`, with the same structure as `en.json`.
2. In `@libs/entity`, add the new code to the `Language` enum. `readStoredLanguage()` and the header dropdown derive from that enum automatically.
3. In the update-language page, add the new option to the `languages` array.

## Where translation is used

- **Header** – nav labels and language switcher  
- **Home page** – hero, value section, how it works, CTA  
- **Profile page** – title and “Back to Home”  
- **User info** – “User ID” label  
- **Update language page** – title, button, back link  
