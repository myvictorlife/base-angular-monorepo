import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'neutral' | 'brand' | 'danger' | 'success' | 'warning' | 'info';
export type BadgeVariant = 'solid' | 'soft' | 'outline';

/**
 * Small status/label pill. Covers the "chip" case too — the `--pill` radius and
 * the tone are the only things that differed between the two in this codebase.
 */
@Component({
  selector: 'lib-badge',
  template: '<ng-content />',
  styleUrl: './badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses()' },
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');
  readonly variant = input<BadgeVariant>('soft');
  /** Fully rounded, for tag-like usage. */
  readonly pill = input(false);

  protected readonly hostClasses = computed(() =>
    ['badge', `badge--${this.tone()}`, `badge--${this.variant()}`, this.pill() ? 'badge--pill' : '']
      .filter(Boolean)
      .join(' ')
  );
}
