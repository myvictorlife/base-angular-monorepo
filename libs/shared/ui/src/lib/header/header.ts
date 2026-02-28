import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Language } from '@libs/entity';
import { TranslationLibModule, UpdateLanguageService } from '@libs/translation';
import { TranslateService } from '@ngx-translate/core';

/** Map each Language enum value to its i18n key so the header always shows all available languages. */
const LANGUAGE_LABEL_KEYS: Record<string, string> = {
  [Language.English]: 'LANGUAGE.EN',
  [Language.Dutch]: 'LANGUAGE.NL',
  [Language.French]: 'LANGUAGE.FR',
};

@Component({
  selector: 'lib-header',
  imports: [CommonModule, RouterLink, TranslationLibModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private readonly translate = inject(TranslateService);
  private readonly updateLanguage = inject(UpdateLanguageService);

  readonly currentLang = signal(this.translate.currentLang || Language.English);
  readonly languageDropdownOpen = signal(false);

  /** All languages from the enum so the header always shows every available language. */
  readonly languages: { code: string; labelKey: string }[] = (Object.values(Language) as string[]).map(
    code => ({ code, labelKey: LANGUAGE_LABEL_KEYS[code] ?? `LANGUAGE.${code.toUpperCase()}` })
  );

  constructor() {
    effect(onCleanup => {
      const sub = this.translate.onLangChange.subscribe(ev => this.currentLang.set(ev.lang));
      onCleanup(() => sub.unsubscribe());
    });
  }

  toggleLanguageDropdown(): void {
    this.languageDropdownOpen.update(open => !open);
  }

  closeLanguageDropdown(): void {
    this.languageDropdownOpen.set(false);
  }

  onLanguageChange(code: string): void {
    this.updateLanguage.changeLanguage(code);
    this.currentLang.set(code);
    this.closeLanguageDropdown();
  }
}
