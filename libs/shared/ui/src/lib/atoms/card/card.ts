import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * Surface container. Projects three optional slots so a card can carry a header
 * and footer without the caller rebuilding the layout each time:
 *
 *   <lib-card>
 *     <span card-header>Title</span>
 *     Body
 *     <span card-footer>Actions</span>
 *   </lib-card>
 */
@Component({
  selector: 'lib-card',
  templateUrl: './card.html',
  styleUrl: './card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses()' },
})
export class CardComponent {
  readonly padding = input<CardPadding>('md');
  /** Lift off the page with a shadow instead of relying on the border alone. */
  readonly elevated = input(false);

  protected readonly hostClasses = computed(() =>
    ['card', `card--pad-${this.padding()}`, this.elevated() ? 'card--elevated' : '']
      .filter(Boolean)
      .join(' ')
  );
}
