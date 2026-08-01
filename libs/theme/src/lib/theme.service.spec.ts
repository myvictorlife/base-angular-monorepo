import { TestBed } from '@angular/core/testing';
import { THEME_STORAGE_KEY, ThemeService } from './theme.service';

/** Minimal MediaQueryList stub whose `matches` we control per test. */
class MediaQueryStub {
  private listeners: ((e: { matches: boolean }) => void)[] = [];
  constructor(public matches: boolean) {}
  addEventListener(_: string, listener: (e: { matches: boolean }) => void): void {
    this.listeners.push(listener);
  }
  emit(matches: boolean): void {
    this.matches = matches;
    this.listeners.forEach((l) => l({ matches }));
  }
}

describe('ThemeService', () => {
  let media: MediaQueryStub;
  let root: HTMLElement;

  const setup = (osPrefersDark = false): ThemeService => {
    media = new MediaQueryStub(osPrefersDark);
    // jsdom does not implement matchMedia at all, so it has to be defined rather
    // than spied on. (The service tolerates its absence — `this.media?.` — which
    // is what keeps it safe on any non-browser platform.)
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: () => media,
    });
    TestBed.configureTestingModule({});
    const service = TestBed.inject(ThemeService);
    root = document.documentElement;
    return service;
  };

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.classList.remove('dark');
  });

  it('defaults to following the operating system', () => {
    const service = setup(false);

    expect(service.preference()).toBe('system');
    expect(service.isDark()).toBe(false);
  });

  it('resolves system to dark when the OS prefers dark', () => {
    const service = setup(true);

    expect(service.isDark()).toBe(true);
  });

  it('applies the theme before any change detection runs', () => {
    setup(true);

    // Not TestBed.flushEffects(): the constructor must paint the correct theme,
    // otherwise the first frame flashes the wrong one.
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.classList.contains('dark')).toBe(true);
  });

  it('reacts when the OS preference changes while on system', () => {
    const service = setup(false);
    expect(service.isDark()).toBe(false);

    media.emit(true);

    expect(service.isDark()).toBe(true);
  });

  it('ignores the OS once an explicit preference is set', () => {
    const service = setup(false);

    service.setPreference('dark');
    media.emit(false);

    expect(service.isDark()).toBe(true);
  });

  it('toggle flips the resolved theme', () => {
    const service = setup(false);

    service.toggle();
    expect(service.preference()).toBe('dark');

    service.toggle();
    expect(service.preference()).toBe('light');
  });

  it('restores a saved preference over the OS setting', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');

    const service = setup(true);

    expect(service.preference()).toBe('light');
    expect(service.isDark()).toBe(false);
  });

  it('falls back to system for an unrecognised stored value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'solarized');

    expect(setup(true).preference()).toBe('system');
  });

  it('persists the choice', () => {
    const service = setup(false);

    service.setPreference('dark');
    TestBed.tick();

    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('keeps data-theme and the dark class in sync', () => {
    const service = setup(false);

    service.setPreference('dark');
    TestBed.tick();
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(root.classList.contains('dark')).toBe(true);

    service.setPreference('light');
    TestBed.tick();
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(root.classList.contains('dark')).toBe(false);
  });
});
