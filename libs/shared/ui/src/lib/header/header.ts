import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Language } from '@libs/entity';
import { UpdateLanguageService } from '@libs/translation';
import { TranslatePipe } from '@ngx-translate/core';

/** Map each Language enum value to its i18n key so the header always shows all available languages. */
const LANGUAGE_LABEL_KEYS: Record<string, string> = {
  [Language.English]: 'LANGUAGE.EN',
  [Language.Dutch]: 'LANGUAGE.NL',
  [Language.French]: 'LANGUAGE.FR',
};

@Component({
  selector: 'lib-header',
  imports: [UpperCasePipe, RouterLink, TranslatePipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly updateLanguage = inject(UpdateLanguageService);

  /** ngx-translate owns the active language; read it, never mirror it. */
  readonly currentLang = computed(() => this.updateLanguage.currentLanguage() ?? Language.English);
  readonly languageDropdownOpen = signal(false);

  /** All languages from the enum so the header always shows every available language. */
  readonly languages: { code: Language; labelKey: string }[] = (Object.values(Language) as Language[]).map(
    code => ({ code, labelKey: LANGUAGE_LABEL_KEYS[code] ?? `LANGUAGE.${code.toUpperCase()}` })
  );

  toggleLanguageDropdown(): void {
    this.languageDropdownOpen.update(open => !open);
  }

  closeLanguageDropdown(): void {
    this.languageDropdownOpen.set(false);
  }

  onLanguageChange(code: Language): void {
    this.updateLanguage.changeLanguage(code);
    this.closeLanguageDropdown();
  }
}
