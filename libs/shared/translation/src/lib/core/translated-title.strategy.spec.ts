import { TestBed } from '@angular/core/testing';
import { Language } from '@libs/entity';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import {
  APP_TITLE,
  TranslatedTitleStrategy,
} from './translated-title.strategy';

class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({ PROFILE: { TITLE: 'Profile' } });
  }
}

describe('TranslatedTitleStrategy', () => {
  let strategy: TranslatedTitleStrategy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService({
          loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
          lang: Language.English,
          fallbackLang: Language.English,
        }),
      ],
    });

    strategy = TestBed.inject(TranslatedTitleStrategy);
  });

  it('translates a route title key and appends the app name', () => {
    expect(strategy.resolve('PROFILE.TITLE')).toBe(`Profile · ${APP_TITLE}`);
  });

  it('falls back to the app name alone when the route has no title', () => {
    expect(strategy.resolve(undefined)).toBe(APP_TITLE);
  });

  it('falls back to the app name when the key has no bundle entry', () => {
    // `instant` echoes the key back for a missing entry — shipping that echo
    // as the tab title is exactly what this strategy exists to prevent.
    expect(strategy.resolve('MISSING.KEY')).toBe(APP_TITLE);
  });
});
