import { EnvironmentProviders, Provider } from '@angular/core';
import { TitleStrategy } from '@angular/router';
import { Language } from '@libs/entity';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideDocumentLanguage } from './document-language';
import { readStoredLanguage } from './language-storage';
import { TranslatedTitleStrategy } from './translated-title.strategy';

/**
 * Root translation setup. Add once in the application config, alongside
 * `provideHttpClient()` which the HTTP loader depends on.
 *
 * Replaces the former TranslationLibModule: `TranslateModule.forChild()` quietly
 * provided its own TranslateService bound to a non-overridable loader, which made
 * every translating component untestable.
 */
export function provideTranslation(): (Provider | EnvironmentProviders)[] {
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
    provideDocumentLanguage(),
    { provide: TitleStrategy, useExisting: TranslatedTitleStrategy },
  ];
}
