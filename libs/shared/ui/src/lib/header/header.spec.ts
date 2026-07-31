import { provideRouter } from '@angular/router';
import { Language } from '@libs/entity';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import {
  TranslateLoader,
  TranslateService,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { HeaderComponent } from './header';

class StubTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of({
      HEADER: {
        HOME: lang === Language.French ? 'Accueil' : 'Home',
        START: 'Get started',
        LANGUAGE: 'Language',
        LANGUAGE_ARIA: 'Change language',
        MENU_ARIA: 'Open menu',
      },
      LANGUAGE: { EN: 'English', NL: 'Dutch', FR: 'French' },
    });
  }
}

describe('HeaderComponent', () => {
  let spectator: Spectator<HeaderComponent>;

  const createComponent = createComponentFactory({
    component: HeaderComponent,
    providers: [
      provideRouter([]),
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
    expect(spectator.component.languages.map((l) => l.code)).toEqual(Object.values(Language));
  });

  it('starts with the dropdown closed', () => {
    expect(spectator.component.languageDropdownOpen()).toBe(false);
    expect(spectator.query('.header__lang-list')).toBeNull();
  });

  it('opens and closes the dropdown', () => {
    spectator.click('.header__lang-trigger');
    expect(spectator.component.languageDropdownOpen()).toBe(true);
    expect(spectator.query('.header__lang-list')).not.toBeNull();

    spectator.component.closeLanguageDropdown();
    spectator.detectChanges();
    expect(spectator.query('.header__lang-list')).toBeNull();
  });

  it('reflects the active language without mirroring it in local state', () => {
    expect(spectator.component.currentLang()).toBe(Language.English);

    spectator.inject(TranslateService).use(Language.French);
    spectator.detectChanges();

    expect(spectator.component.currentLang()).toBe(Language.French);
  });

  it('changes language and closes the dropdown on selection', () => {
    spectator.click('.header__lang-trigger');

    spectator.component.onLanguageChange(Language.Dutch);
    spectator.detectChanges();

    expect(spectator.inject(TranslateService).getCurrentLang()).toBe(Language.Dutch);
    expect(spectator.component.languageDropdownOpen()).toBe(false);
  });

  it('re-renders translated labels when the language changes', () => {
    expect(spectator.query('.header__link')?.textContent).toContain('Home');

    spectator.inject(TranslateService).use(Language.French);
    spectator.detectChanges();

    expect(spectator.query('.header__link')?.textContent).toContain('Accueil');
  });

  describe('mobile menu', () => {
    it('starts closed and reports it to assistive tech', () => {
      expect(spectator.component.mobileMenuOpen()).toBe(false);
      expect(spectator.query('#header-mobile-menu')).toBeNull();
      expect(spectator.query('.header__menu-btn')).toHaveAttribute('aria-expanded', 'false');
    });

    it('opens on click and exposes the nav links that the bar hides on mobile', () => {
      spectator.click('.header__menu-btn');
      spectator.detectChanges();

      const menu = spectator.query('#header-mobile-menu');
      expect(menu).not.toBeNull();
      expect(menu?.textContent).toContain('Home');
      expect(menu?.textContent).toContain('Get started');
      expect(spectator.query('.header__menu-btn')).toHaveAttribute('aria-expanded', 'true');
    });

    it('closes when a link inside it is followed', () => {
      spectator.click('.header__menu-btn');
      spectator.detectChanges();

      spectator.click('.header__mobile-link');
      spectator.detectChanges();

      expect(spectator.component.mobileMenuOpen()).toBe(false);
      expect(spectator.query('#header-mobile-menu')).toBeNull();
    });

    it('closes on backdrop click', () => {
      spectator.click('.header__menu-btn');
      spectator.detectChanges();

      spectator.click('.header__mobile-backdrop');
      spectator.detectChanges();

      expect(spectator.component.mobileMenuOpen()).toBe(false);
    });

    it('closes on Escape', () => {
      spectator.click('.header__menu-btn');
      spectator.detectChanges();

      spectator.dispatchKeyboardEvent(document, 'keydown', 'Escape');
      spectator.detectChanges();

      expect(spectator.component.mobileMenuOpen()).toBe(false);
    });

    it('closes the language dropdown on Escape too', () => {
      spectator.click('.header__lang-trigger');
      spectator.detectChanges();
      expect(spectator.component.languageDropdownOpen()).toBe(true);

      spectator.dispatchKeyboardEvent(document, 'keydown', 'Escape');
      spectator.detectChanges();

      expect(spectator.component.languageDropdownOpen()).toBe(false);
    });

    it('never shows both overlays at once', () => {
      spectator.click('.header__menu-btn');
      spectator.detectChanges();

      spectator.click('.header__lang-trigger');
      spectator.detectChanges();

      expect(spectator.component.languageDropdownOpen()).toBe(true);
      expect(spectator.component.mobileMenuOpen()).toBe(false);
    });
  });
});
