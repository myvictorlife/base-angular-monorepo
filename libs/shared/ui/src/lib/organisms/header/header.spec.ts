import { provideRouter } from '@angular/router';
import { Language } from '@libs/entity';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
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
        MENU_ARIA: 'Open menu',
        GITHUB: 'GitHub',
        GITHUB_ARIA: 'View the source on GitHub',
      },
      LANGUAGE_SELECT: {
        TRIGGER_ARIA: 'Change language',
        LIST_ARIA: 'Language',
      },
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
    // The header renders <lib-theme-toggle>, which injects ThemeService, which
    // reads matchMedia — absent in jsdom. Stub it to a light-preferring OS.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: () => ({ matches: false, addEventListener: () => undefined }),
    });
    spectator = createComponent();
    spectator.detectChanges();
  });

  it('renders the language select from the design system', () => {
    expect(spectator.query('lib-language-select')).not.toBeNull();
  });

  it('re-renders translated labels when the language changes', () => {
    expect(spectator.query('.header__link')?.textContent).toContain('Home');

    spectator.inject(TranslateService).use(Language.French);
    spectator.detectChanges();

    expect(spectator.query('.header__link')?.textContent).toContain('Accueil');
  });

  describe('repository link', () => {
    const repoUrl = 'https://github.com/acme/repo';

    it('renders nothing by default — the state of a clone with no site config', () => {
      expect(spectator.query('.header__github')).toBeNull();
    });

    it('renders an external link when a URL is provided', () => {
      spectator.setInput('repoUrl', repoUrl);

      const link = spectator.query('.header__github');
      expect(link).toHaveAttribute('href', repoUrl);
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('aria-label', 'View the source on GitHub');
    });

    it('appears in the mobile menu too', () => {
      spectator.setInput('repoUrl', repoUrl);

      spectator.click('.header__menu-btn');
      spectator.detectChanges();

      const menu = spectator.query('#header-mobile-menu');
      expect(menu?.textContent).toContain('GitHub');
    });
  });

  describe('mobile menu', () => {
    it('starts closed and reports it to assistive tech', () => {
      expect(spectator.component.mobileMenuOpen()).toBe(false);
      expect(spectator.query('#header-mobile-menu')).toBeNull();
      expect(spectator.query('.header__menu-btn')).toHaveAttribute(
        'aria-expanded',
        'false',
      );
    });

    it('opens on click and exposes the nav links that the bar hides on mobile', () => {
      spectator.click('.header__menu-btn');
      spectator.detectChanges();

      const menu = spectator.query('#header-mobile-menu');
      expect(menu).not.toBeNull();
      expect(menu?.textContent).toContain('Home');
      expect(menu?.textContent).toContain('Get started');
      expect(spectator.query('.header__menu-btn')).toHaveAttribute(
        'aria-expanded',
        'true',
      );
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

      // Dispatched natively: Spectator's dispatchKeyboardEvent goes through the
      // legacy initKeyboardEvent API, which jsdom rejects under Vitest.
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      spectator.detectChanges();

      expect(spectator.component.mobileMenuOpen()).toBe(false);
    });

    it('never shows both overlays at once', () => {
      spectator.click('.header__menu-btn');
      spectator.detectChanges();

      // Opening the language dropdown must close the menu…
      spectator.click('.language-select__trigger');
      spectator.detectChanges();
      expect(spectator.component.mobileMenuOpen()).toBe(false);
      expect(spectator.query('.language-select__list')).not.toBeNull();

      // …and opening the menu must close the dropdown.
      spectator.click('.header__menu-btn');
      spectator.detectChanges();
      expect(spectator.component.mobileMenuOpen()).toBe(true);
      expect(spectator.query('.language-select__list')).toBeNull();
    });
  });
});
