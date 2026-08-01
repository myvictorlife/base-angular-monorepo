import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Label + description on the left, whatever control the caller projects on the
 * right. A molecule rather than an atom: it composes text and a slot, and it owns
 * no behaviour of its own.
 */
@Component({
  selector: 'lib-setting-row',
  imports: [TranslatePipe],
  templateUrl: './setting-row.html',
  styleUrls: ['./setting-row.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingRowComponent {
  readonly labelKey = input.required<string>();
  readonly descriptionKey = input<string>();
}
