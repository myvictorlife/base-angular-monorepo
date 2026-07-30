import { DOCUMENT, effect, inject, provideEnvironmentInitializer } from '@angular/core';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

/**
 * Keeps `<html lang>` in sync with the active language.
 *
 * Without this the document stays on whatever `index.html` hardcoded, so screen
 * readers announce every language with English pronunciation rules and crawlers
 * index the page under the wrong locale.
 */
export function provideDocumentLanguage(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const translate = inject(TranslateService);
      const document = inject(DOCUMENT);

      effect(() => {
        const lang = translate.currentLang();
        if (lang) {
          document.documentElement.lang = lang;
        }
      });
    }),
  ]);
}
