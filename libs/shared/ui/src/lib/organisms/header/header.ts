import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ThemeToggleComponent } from '../../atoms/theme-toggle/theme-toggle';
import { LanguageSelectComponent } from '../../molecules/language-select/language-select';

@Component({
  selector: 'lib-header',
  imports: [
    RouterLink,
    TranslatePipe,
    ThemeToggleComponent,
    LanguageSelectComponent,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    // Escape closes the menu. Bound on the document because the backdrop
    // swallows clicks but never receives keyboard focus.
    '(document:keydown.escape)': 'closeMobileMenu()',
  },
})
export class HeaderComponent {
  /**
   * URL of the repository this deployment was built from. `null` — the default,
   * and the state of any clone without `config/site.json` — renders no GitHub
   * link at all. An input rather than a read of `@libs/environment` so the
   * organism stays presentational; the app decides what, if anything, to link.
   */
  readonly repoUrl = input<string | null>(null);

  readonly mobileMenuOpen = signal(false);

  private readonly languageSelect = viewChild(LanguageSelectComponent);

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
    // Two overlays open at once would overlap; the one just asked for wins.
    if (this.mobileMenuOpen()) this.languageSelect()?.close();
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  /** The language dropdown opened — same exclusivity rule, other direction. */
  onLanguageOpened(): void {
    this.closeMobileMenu();
  }
}
