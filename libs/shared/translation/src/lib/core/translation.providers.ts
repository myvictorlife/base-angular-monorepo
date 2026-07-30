import { Provider } from '@angular/core';
import { Language } from '@libs/entity';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { readStoredLanguage } from './language-storage';

/**
 * Root translation setup. Add once in the application config, alongside
 * `provideHttpClient()` which the HTTP loader depends on.
 *
 * Replaces the former TranslationLibModule: `TranslateModule.forChild()` quietly
 * provided its own TranslateService bound to a non-overridable loader, which made
 * every translating component untestable.
 */
export function provideTranslation(): Provider[] {
  return [
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json',
        // A missing i18n file should break loudly at deploy time rather than
        // silently serving partial translations (v18 defaults to {} on 404).
        failOnError: true,
      }),
      fallbackLang: Language.English,
      lang: readStoredLanguage(),
    }),
  ];
}
