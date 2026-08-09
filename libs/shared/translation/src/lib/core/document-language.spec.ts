import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Language } from '@libs/entity';
import {
  TranslateLoader,
  TranslateService,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { provideDocumentLanguage } from './document-language';

class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({});
  }
}

describe('provideDocumentLanguage', () => {
  let translate: TranslateService;
  let html: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService({
          loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
          lang: Language.English,
          fallbackLang: Language.English,
        }),
        provideDocumentLanguage(),
      ],
    });

    translate = TestBed.inject(TranslateService);
    html = TestBed.inject(DOCUMENT).documentElement;
  });

  it('stamps the initial language and direction on <html>', () => {
    TestBed.tick();

    expect(html.lang).toBe(Language.English);
    expect(html.dir).toBe('ltr');
  });

  it('follows a language change', () => {
    translate.use(Language.Portuguese);
    TestBed.tick();

    expect(html.lang).toBe(Language.Portuguese);
    expect(html.dir).toBe('ltr');
  });

  it('switches the document to rtl for Arabic, and back', () => {
    translate.use(Language.Arabic);
    TestBed.tick();
    expect(html.lang).toBe(Language.Arabic);
    expect(html.dir).toBe('rtl');

    translate.use(Language.French);
    TestBed.tick();
    expect(html.dir).toBe('ltr');
  });
});
