import {
  DOCUMENT,
  effect,
  inject,
  provideEnvironmentInitializer,
} from '@angular/core';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { LANGUAGE_METADATA, Language } from '@libs/entity';
import { TranslateService } from '@ngx-translate/core';

/**
 * Keeps `<html lang>` and `<html dir>` in sync with the active language.
 *
 * Without the first the document stays on whatever `index.html` hardcoded, so
 * screen readers announce every language with English pronunciation rules and
 * crawlers index the page under the wrong locale. Without the second an RTL
 * language renders left-to-right, which is simply the wrong reading order.
 * `dir` flips flex/grid flow and text alignment for free; only styles written
 * with physical properties (`margin-left` instead of `margin-inline-start`)
 * keep their LTR bias and need a case-by-case fix.
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
          document.documentElement.dir =
            LANGUAGE_METADATA[lang as Language]?.dir ?? 'ltr';
        }
      });
    }),
  ]);
}
