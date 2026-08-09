import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Every icon in the shared set — the single source of truth. The design system
 * catalogue iterates this array, so a new icon needs one entry here plus one
 * `@case` in the template.
 *
 * Deliberately small: every icon here ships in the bundle whether it is used or
 * not (a `@switch` cannot be tree-shaken), so the set is curated rather than
 * exhaustive. Add on demand.
 */
export const ICON_NAMES = [
  'check',
  'chevron-down',
  'chevron-left',
  'chevron-right',
  'close',
  'external-link',
  'github',
  'globe',
  'info',
  'menu',
  'moon',
  'search',
  'sun',
  'warning',
] as const;

export type IconName = (typeof ICON_NAMES)[number];
export type IconSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'lib-icon',
  templateUrl: './icon.html',
  styleUrl: './icon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"icon icon--" + size()',
    // Icons are decorative by default. Pass a label when the icon is the only
    // content of an interactive element, and it becomes an img to screen readers.
    '[attr.aria-hidden]': 'label() ? null : true',
    '[attr.role]': 'label() ? "img" : null',
    '[attr.aria-label]': 'label()',
  },
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input<IconSize>('md');
  readonly label = input<string | null>(null);
}
