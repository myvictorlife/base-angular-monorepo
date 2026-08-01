import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Indeterminate loading indicator.
 *
 * `role="status"` + a label means assistive tech announces the wait instead of
 * silence. Under prefers-reduced-motion the theme layer already flattens the
 * animation, so no media query is needed here.
 */
@Component({
  selector: 'lib-spinner',
  template: '',
  styleUrl: './spinner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"spinner spinner--" + size()',
    role: 'status',
    '[attr.aria-label]': 'label()',
  },
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('md');
  readonly label = input('Loading');
}
