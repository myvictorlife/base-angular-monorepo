import { Language } from '@libs/entity';
import { ThemeService } from '@libs/theme';
import { UpdateLanguageService } from '@libs/translation';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { SettingsStore } from '../../+state/settings.store';
import { Settings } from './settings';

/** Serves the strings the template needs without touching HTTP. */
class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({
      SETTINGS: {
        TITLE: 'Settings',
        LEAD: 'Preferences are stored on this device.',
        THEME: 'Theme',
        THEME_DESC: 'System follows your operating system setting.',
        THEME_LIGHT: 'Light',
        THEME_DARK: 'Dark',
        THEME_SYSTEM: 'System',
        LANGUAGE: 'Language',
        LANGUAGE_DESC: 'Applies immediately.',
        REDUCE_MOTION: 'Reduce motion',
        REDUCE_MOTION_DESC: 'Minimises transitions.',
      },
    });
  }
}

describe('Settings', () => {
  let spectator: Spectator<Settings>;

  const themeService = {
    setPreference: vi.fn(),
    preference: () => 'system',
    isDark: () => false,
  };
  const languageService = {
    changeLanguage: vi.fn(),
    currentLanguage: () => Language.English,
  };

  const createComponent = createComponentFactory({
    component: Settings,
    providers: [
      { provide: ThemeService, useValue: themeService },
      { provide: UpdateLanguageService, useValue: languageService },
      // Normally provided by the settings route, so a component-level test has to
      // register it explicitly.
      SettingsStore,
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: 'en',
        fallbackLang: 'en',
      }),
    ],
  });

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('reduce-motion');
    themeService.setPreference.mockReset();
    languageService.changeLanguage.mockReset();
    spectator = createComponent();
    spectator.detectChanges();
  });

  it('renders one row per setting', () => {
    expect(spectator.queryAll('lib-setting-row')).toHaveLength(3);
  });

  it('renders the translated labels rather than raw keys', () => {
    expect(spectator.query('.page-header__title')?.textContent).toContain(
      'Settings',
    );
    expect(spectator.element.textContent).toContain('Reduce motion');
  });

  it('marks the active theme segment, reading it from ThemeService', () => {
    const active = spectator.query('.segmented__segment--active');
    expect(active?.textContent).toContain('System');
  });

  it('forwards a theme click to ThemeService', () => {
    spectator.click(
      spectator
        .queryAll('[role="radiogroup"]')[0]
        .querySelectorAll('button')[1],
    );

    expect(themeService.setPreference).toHaveBeenCalledWith('dark');
  });

  it('forwards a language click to UpdateLanguageService', () => {
    spectator.click(
      spectator
        .queryAll('[role="radiogroup"]')[1]
        .querySelectorAll('button')[3],
    );

    expect(languageService.changeLanguage).toHaveBeenCalledWith(
      Language.Portuguese,
    );
  });

  it('toggles reduce motion and reflects it on the switch', () => {
    expect(
      spectator.query('[role="switch"]')?.getAttribute('aria-checked'),
    ).toBe('false');

    spectator.click('[role="switch"]');
    spectator.detectChanges();

    expect(
      spectator.query('[role="switch"]')?.getAttribute('aria-checked'),
    ).toBe('true');
    expect(document.documentElement.classList.contains('reduce-motion')).toBe(
      true,
    );
  });
});
