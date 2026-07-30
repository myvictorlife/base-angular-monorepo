import { TestBed } from '@angular/core/testing';
import { Language } from '@libs/entity';
import {
  TranslateLoader,
  TranslateService,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { LANGUAGE_STORAGE_KEY } from './language-storage';
import { UpdateLanguageService } from './update-language.service';

class StubTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of({ GREETING: `hello-${lang}` });
  }
}

describe('UpdateLanguageService', () => {
  let service: UpdateLanguageService;
  let translate: TranslateService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService({
          loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
          lang: Language.English,
          fallbackLang: Language.English,
        }),
      ],
    });
    service = TestBed.inject(UpdateLanguageService);
    translate = TestBed.inject(TranslateService);
  });

  it('exposes the active language as a signal', () => {
    expect(service.currentLanguage()).toBe(Language.English);
  });

  it('activates the chosen language', () => {
    service.changeLanguage(Language.Dutch);

    expect(translate.getCurrentLang()).toBe(Language.Dutch);
    expect(service.currentLanguage()).toBe(Language.Dutch);
  });

  it('persists the choice so it survives a reload', () => {
    service.changeLanguage(Language.French);

    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(Language.French);
  });

  it('actually swaps the served translations', () => {
    service.changeLanguage(Language.French);

    expect(translate.instant('GREETING')).toBe('hello-fr');
  });
});
