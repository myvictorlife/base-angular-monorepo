import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { LANGUAGE_METADATA, Language } from '@libs/entity';
import { UpdateLanguageService } from '@libs/translation';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * The workspace's language picker, extracted from the header so any surface can
 * reuse it. Options are labelled with each language's endonym straight from
 * `LANGUAGE_METADATA` — never translated, because the person who needs the
 * picker most is the one who cannot read the current language.
 */
@Component({
  selector: 'lib-language-select',
  imports: [UpperCasePipe, TranslatePipe],
  templateUrl: './language-select.html',
  styleUrl: './language-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Bound on the document because the backdrop swallows clicks but never
    // receives keyboard focus.
    '(document:keydown.escape)': 'close()',
  },
})
export class LanguageSelectComponent {
  private readonly updateLanguage = inject(UpdateLanguageService);

  /** ngx-translate owns the active language; read it, never mirror it. */
  readonly currentLang = computed(
    () => this.updateLanguage.currentLanguage() ?? Language.English,
  );
  readonly open = signal(false);

  /** Fired when the dropdown opens, so a host can close its own overlays. */
  readonly opened = output<void>();

  /** Every language in the enum, labelled with its endonym. */
  readonly languages = (Object.values(Language) as Language[]).map((code) => ({
    code,
    label: LANGUAGE_METADATA[code].label,
  }));

  toggle(): void {
    this.open.update((open) => !open);
    if (this.open()) this.opened.emit();
  }

  close(): void {
    this.open.set(false);
  }

  select(code: Language): void {
    this.updateLanguage.changeLanguage(code);
    this.close();
  }
}
