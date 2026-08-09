import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export interface SegmentedControlOption<T extends string = string> {
  value: T;
  /** Translation key for the segment label. Ignored when `label` is set. */
  labelKey?: string;
  /**
   * Pre-resolved label rendered verbatim — for text that must not go through
   * the translator, such as language endonyms.
   */
  label?: string;
  /** BCP-47 tag set on the segment when its label is in another language. */
  lang?: string;
}

/**
 * Exclusive-choice segmented control.
 *
 * A `role="radiogroup"` of native buttons rather than styled radio inputs: no
 * form participation is needed, and screen readers announce one choice among
 * the group. Controlled: the host owns the value — a click asks for a segment
 * via `valueChange`, it never selects itself.
 */
@Component({
  selector: 'lib-segmented-control',
  imports: [TranslatePipe],
  templateUrl: './segmented-control.html',
  styleUrl: './segmented-control.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SegmentedControlComponent<T extends string = string> {
  readonly options = input.required<readonly SegmentedControlOption<T>[]>();
  readonly value = input.required<T | null>();
  /** Accessible name of the group, already translated. */
  readonly label = input.required<string>();

  readonly valueChange = output<T>();

  select(value: T): void {
    // Radio semantics: re-clicking the selected segment is a no-op.
    if (value !== this.value()) this.valueChange.emit(value);
  }
}
