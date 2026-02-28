# Translation (i18n)

Multi-language support for the project using [ngx-translate](https://github.com/ngx-translate/core).

## Supported languages

- **en** – English  
- **nl** – Dutch  
- **fr** – French  

## Usage

1. **In templates:** use the `translate` pipe where the app is configured to load the translation module (e.g. `TranslationLibModule`):

   ```html
   {{ 'HOME.HERO_TITLE' | translate }}
   ```

2. **In components:** inject `TranslateService` and call `instant()` or `get()`:

   ```ts
   private readonly translate = inject(TranslateService);
   this.translate.instant('PROFILE.TITLE');
   ```

3. **Changing language:** use `UpdateLanguageService.changeLanguage(code)` or the header language dropdown. The chosen language is stored in `localStorage` and reused on reload.

## Adding new keys

Edit the JSON files under **`apps/genai-app/src/assets/i18n/`**:

- `en.json` – English  
- `nl.json` – Dutch  
- `fr.json` – French  

Use the same key in all files (e.g. `"MY_SECTION.MY_KEY": "Text"`).

## Adding a new language

1. Add a new file in `apps/genai-app/src/assets/i18n/`, e.g. `de.json`, with the same structure as `en.json`.
2. In `@libs/entity`, add the new code to the `Language` enum.
3. In `UpdateLanguageService` (and anywhere that lists languages), include the new language in `supportedLanguages` and in the header dropdown `languages` array (in `HeaderComponent`).
4. In the update-language page, add the new option to the `languages` array.

## Where translation is used

- **Header** – nav labels and language switcher  
- **Home page** – hero, value section, how it works, CTA  
- **Profile page** – title and “Back to Home”  
- **User info** – “User ID” label  
- **Update language page** – title, button, back link  

Ensure any component that uses the `translate` pipe imports `TranslationLibModule` (or another module that exports `TranslateModule`).
