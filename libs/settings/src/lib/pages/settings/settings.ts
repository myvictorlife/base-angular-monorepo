import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LANGUAGE_METADATA, Language } from '@libs/entity';
import { ThemePreference } from '@libs/theme';
import { TranslatePipe } from '@ngx-translate/core';
import { SettingsStore } from '../../+state/settings.store';
import { SettingRowComponent } from '../../molecules/setting-row/setting-row';

/** Rendered as a segmented control; order is the order shown. */
const THEME_OPTIONS: readonly { value: ThemePreference; labelKey: string }[] = [
  { value: 'light', labelKey: 'SETTINGS.THEME_LIGHT' },
  { value: 'dark', labelKey: 'SETTINGS.THEME_DARK' },
  { value: 'system', labelKey: 'SETTINGS.THEME_SYSTEM' },
];

/**
 * Derived from the enum + LANGUAGE_METADATA, so a new language shows up here
 * with no edit. Labels are endonyms on purpose — see `LanguageMetadata.label`.
 */
const LANGUAGE_OPTIONS: readonly { value: Language; label: string }[] = (
  Object.values(Language) as Language[]
).map((value) => ({ value, label: LANGUAGE_METADATA[value].label }));

@Component({
  selector: 'lib-settings',
  imports: [SettingRowComponent, TranslatePipe],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  private readonly store = inject(SettingsStore);

  readonly themeOptions = THEME_OPTIONS;
  readonly languageOptions = LANGUAGE_OPTIONS;

  // Read straight off the store — already signals, so no selector layer and
  // nothing to unsubscribe from.
  readonly themePreference = this.store.themePreference;
  readonly currentLanguage = this.store.currentLanguage;
  readonly reduceMotion = this.store.reduceMotion;

  setTheme(preference: ThemePreference): void {
    this.store.setThemePreference(preference);
  }

  setLanguage(language: Language): void {
    this.store.setLanguage(language);
  }

  toggleReduceMotion(): void {
    this.store.setReduceMotion(!this.reduceMotion());
  }
}
