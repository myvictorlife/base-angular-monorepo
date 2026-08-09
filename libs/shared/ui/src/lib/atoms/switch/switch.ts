import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

/**
 * On/off toggle switch.
 *
 * A native `<button role="switch">` with `aria-checked`, so screen readers
 * announce it as a switch and it needs no label element. Controlled: the host
 * owns the state — the switch renders `checked` and asks for the opposite via
 * `checkedChange`, it never flips itself.
 */
@Component({
  selector: 'lib-switch',
  templateUrl: './switch.html',
  styleUrl: './switch.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent {
  readonly checked = input.required<boolean>();
  /** Accessible name, already translated — the control renders no visible text. */
  readonly label = input.required<string>();
  readonly disabled = input(false);

  readonly checkedChange = output<boolean>();

  toggle(): void {
    this.checkedChange.emit(!this.checked());
  }
}
