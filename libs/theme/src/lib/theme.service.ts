import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';

export type ThemePreference = 'light' | 'dark' | 'system';

/** localStorage key holding the user's theme choice across sessions. */
export const THEME_STORAGE_KEY = 'theme';

const isThemePreference = (value: string | null): value is ThemePreference =>
  value === 'light' || value === 'dark' || value === 'system';

/**
 * Single source of truth for the light/dark theme.
 *
 * 1. Reads the saved preference from localStorage.
 * 2. `system` (the default) follows `prefers-color-scheme`, reacting live when
 *    the OS setting changes.
 * 3. Applies `data-theme` **and** the `dark` class to `<html>`: the design
 *    tokens key off `[data-theme]`, while Tailwind's `dark:` variant needs the
 *    class. Keeping both in sync means either mechanism works.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');

  readonly preference = signal<ThemePreference>(this.resolveInitial());

  private readonly osPrefersDark = signal(this.media?.matches ?? false);

  /** The theme actually in effect, after resolving `system`. */
  readonly isDark = computed(() => {
    const preference = this.preference();
    return preference === 'system' ? this.osPrefersDark() : preference === 'dark';
  });

  constructor() {
    this.media?.addEventListener('change', (event) => this.osPrefersDark.set(event.matches));

    // Applied eagerly as well as in the effect: the effect only runs on the
    // first change detection, which would leave the initial paint unthemed.
    this.apply(this.isDark());

    effect(() => this.apply(this.isDark()));
    effect(() => this.persist(this.preference()));
  }

  toggle(): void {
    this.preference.set(this.isDark() ? 'light' : 'dark');
  }

  setPreference(preference: ThemePreference): void {
    this.preference.set(preference);
  }

  private apply(dark: boolean): void {
    const root = this.document.documentElement;
    root.classList.toggle('dark', dark);
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
  }

  private persist(preference: ThemePreference): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Private browsing or a full quota must not break theming.
    }
  }

  private resolveInitial(): ThemePreference {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (isThemePreference(saved)) return saved;
    } catch {
      // Storage unavailable — fall through to the system preference.
    }
    return 'system';
  }
}
