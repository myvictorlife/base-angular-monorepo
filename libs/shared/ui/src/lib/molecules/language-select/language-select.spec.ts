import { Language } from '@libs/entity';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import {
  TranslateLoader,
  TranslateService,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { LanguageSelectComponent } from './language-select';

class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({
      LANGUAGE_SELECT: {
        TRIGGER_ARIA: 'Change language',
        LIST_ARIA: 'Language',
      },
    });
  }
}

describe('LanguageSelectComponent', () => {
  let spectator: Spectator<LanguageSelectComponent>;

  const createComponent = createComponentFactory({
    component: LanguageSelectComponent,
    providers: [
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: Language.English,
        fallbackLang: Language.English,
      }),
    ],
  });

  beforeEach(() => {
    localStorage.clear();
    spectator = createComponent();
    spectator.detectChanges();
  });

  it('lists every language from the enum', () => {
    expect(spectator.component.languages.map((l) => l.code)).toEqual(
      Object.values(Language),
    );
  });

  it('starts closed', () => {
    expect(spectator.component.open()).toBe(false);
    expect(spectator.query('.language-select__list')).toBeNull();
  });

  it('opens and closes', () => {
    spectator.click('.language-select__trigger');
    expect(spectator.component.open()).toBe(true);
    expect(spectator.query('.language-select__list')).not.toBeNull();

    spectator.component.close();
    spectator.detectChanges();
    expect(spectator.query('.language-select__list')).toBeNull();
  });

  it('labels each option with its endonym, never a translation', () => {
    spectator.click('.language-select__trigger');

    const labels = spectator
      .queryAll('.language-select__option')
      .map((el) => el.textContent?.trim());

    // Endonyms stay identical whatever the active language is.
    expect(labels).toContain('Português');
    expect(labels).toContain('العربية');

    spectator.inject(TranslateService).use(Language.French);
    spectator.detectChanges();
    const after = spectator
      .queryAll('.language-select__option')
      .map((el) => el.textContent?.trim());
    expect(after).toEqual(labels);
  });

  it('changes language and closes on selection', () => {
    spectator.click('.language-select__trigger');

    spectator.component.select(Language.Dutch);
    spectator.detectChanges();

    expect(spectator.inject(TranslateService).getCurrentLang()).toBe(
      Language.Dutch,
    );
    expect(spectator.component.open()).toBe(false);
  });

  it('reflects the active language without mirroring it in local state', () => {
    expect(spectator.component.currentLang()).toBe(Language.English);

    spectator.inject(TranslateService).use(Language.French);
    spectator.detectChanges();

    expect(spectator.component.currentLang()).toBe(Language.French);
  });

  it('closes on backdrop click', () => {
    spectator.click('.language-select__trigger');
    spectator.detectChanges();

    spectator.click('.language-select__backdrop');
    spectator.detectChanges();

    expect(spectator.component.open()).toBe(false);
  });

  it('closes on Escape', () => {
    spectator.click('.language-select__trigger');
    spectator.detectChanges();

    // Dispatched natively: Spectator's dispatchKeyboardEvent goes through the
    // legacy initKeyboardEvent API, which jsdom rejects under Vitest.
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    spectator.detectChanges();

    expect(spectator.component.open()).toBe(false);
  });

  it('announces the dropdown as it opens', () => {
    let openedCount = 0;
    spectator.component.opened.subscribe(() => openedCount++);

    spectator.click('.language-select__trigger');
    expect(openedCount).toBe(1);

    spectator.click('.language-select__trigger');
    expect(openedCount).toBe(1);
  });
});
