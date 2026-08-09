import { Component, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { SwitchComponent } from './switch';

@Component({
  imports: [SwitchComponent],
  template: `<lib-switch
    [checked]="checked()"
    [disabled]="disabled()"
    label="Reduce motion"
    (checkedChange)="onChange($event)"
  />`,
})
class HostComponent {
  readonly checked = signal(false);
  readonly disabled = signal(false);
  readonly onChange = vi.fn();
}

describe('SwitchComponent', () => {
  let spectator: Spectator<HostComponent>;
  const createComponent = createComponentFactory(HostComponent);

  const control = () =>
    spectator.query('button[role="switch"]') as HTMLButtonElement;

  beforeEach(() => (spectator = createComponent()));

  it('renders an accessible switch', () => {
    expect(control()).toExist();
    expect(control().getAttribute('aria-checked')).toBe('false');
    expect(control().getAttribute('aria-label')).toBe('Reduce motion');
  });

  it('reflects the checked state', () => {
    spectator.component.checked.set(true);
    spectator.detectChanges();

    expect(control().getAttribute('aria-checked')).toBe('true');
    expect(control().classList).toContain('switch--on');
  });

  it('asks for the opposite state on click without flipping itself', () => {
    spectator.click(control());

    expect(spectator.component.onChange).toHaveBeenCalledWith(true);
    // Controlled component: the host decides — aria-checked is unchanged.
    expect(control().getAttribute('aria-checked')).toBe('false');
  });

  it('emits the off value when currently on', () => {
    spectator.component.checked.set(true);
    spectator.detectChanges();

    spectator.click(control());

    expect(spectator.component.onChange).toHaveBeenCalledWith(false);
  });

  it('does not emit when disabled', () => {
    spectator.component.disabled.set(true);
    spectator.detectChanges();

    spectator.click(control());

    expect(spectator.component.onChange).not.toHaveBeenCalled();
  });
});
