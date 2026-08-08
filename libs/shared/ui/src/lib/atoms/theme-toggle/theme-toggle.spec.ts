import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { ThemeService } from '@libs/theme';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { ThemeToggleComponent } from './theme-toggle';

class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({
      THEME: {
        SWITCH_TO_DARK: 'Switch to dark theme',
        SWITCH_TO_LIGHT: 'Switch to light theme',
      },
    });
  }
}

describe('ThemeToggleComponent', () => {
  let spectator: Spectator<ThemeToggleComponent>;
  let theme: ThemeService;

  const createComponent = createComponentFactory({
    component: ThemeToggleComponent,
    providers: [
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: 'en',
        fallbackLang: 'en',
      }),
    ],
  });

  beforeEach(() => {
    localStorage.clear();
    // jsdom has no matchMedia; ThemeService tolerates its absence, but define a
    // light-preferring stub so the starting state is deterministic.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: () => ({ matches: false, addEventListener: () => undefined }),
    });
    spectator = createComponent();
    theme = spectator.inject(ThemeService);
    spectator.detectChanges();
  });

  it('starts in light and reports it through aria-pressed', () => {
    expect(spectator.component.isDark()).toBe(false);
    expect(spectator.query('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches the theme on click', () => {
    spectator.click('button');
    spectator.detectChanges();

    expect(theme.isDark()).toBe(true);
    expect(spectator.query('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('announces the action it will perform, not the current state', () => {
    expect(spectator.query('button')).toHaveAttribute(
      'aria-label',
      'Switch to dark theme',
    );

    spectator.click('button');
    spectator.detectChanges();

    expect(spectator.query('button')).toHaveAttribute(
      'aria-label',
      'Switch to light theme',
    );
  });

  it('follows the service when the theme changes elsewhere', () => {
    theme.setPreference('dark');
    spectator.detectChanges();

    expect(spectator.component.isDark()).toBe(true);
  });
});
