import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ThemeService } from '@libs/theme';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Light/dark switch.
 *
 * Reads `ThemeService.isDark` directly — the service owns the state, so there is
 * nothing to mirror here. The button is a native `<button>` with an
 * `aria-pressed` state rather than a checkbox: screen readers announce it as a
 * toggle, and it needs no label element.
 */
@Component({
  selector: 'lib-theme-toggle',
  imports: [TranslatePipe],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  private readonly theme = inject(ThemeService);

  readonly isDark = this.theme.isDark;

  /** Announce what the button will do, not what it currently shows. */
  readonly labelKey = computed(() =>
    this.isDark() ? 'THEME.SWITCH_TO_LIGHT' : 'THEME.SWITCH_TO_DARK'
  );

  toggle(): void {
    this.theme.toggle();
  }
}
