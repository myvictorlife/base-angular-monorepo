import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Design-system button.
 *
 * Applied to a native `<button>` or `<a>` through an attribute selector, so
 * `type`, `disabled`, `href`, `routerLink` and form semantics keep working — a
 * wrapper component would have to re-expose every one of them.
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector -- the native element must stay the host
  selector: 'button[libButton], a[libButton]',
  template: '<ng-content />',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses()' },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('md');
  /** Stretch to the full width of the container. */
  readonly block = input(false);

  protected readonly hostClasses = computed(() =>
    ['btn', `btn--${this.variant()}`, `btn--${this.size()}`, this.block() ? 'btn--block' : '']
      .filter(Boolean)
      .join(' ')
  );
}
