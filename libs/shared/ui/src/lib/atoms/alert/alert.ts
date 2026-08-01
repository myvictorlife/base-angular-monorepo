import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent, IconName } from '../icon/icon';

export type AlertTone = 'danger' | 'success' | 'warning' | 'info';

const TONE_ICONS: Record<AlertTone, IconName> = {
  danger: 'warning',
  success: 'check',
  warning: 'warning',
  info: 'info',
};

/**
 * Inline feedback message.
 *
 * `danger` announces assertively (`role="alert"`); the calmer tones use
 * `role="status"` so they do not interrupt a screen reader mid-sentence.
 */
@Component({
  selector: 'lib-alert',
  imports: [IconComponent],
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': '"alert alert--" + tone()',
    '[attr.role]': 'tone() === "danger" ? "alert" : "status"',
  },
})
export class AlertComponent {
  readonly tone = input<AlertTone>('info');
  readonly heading = input<string | null>(null);

  protected readonly icon = computed(() => TONE_ICONS[this.tone()]);
}
