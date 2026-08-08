import { Component, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { AlertComponent, AlertTone } from './alert';

@Component({
  imports: [AlertComponent],
  template: `
    <lib-alert [tone]="tone()" [heading]="heading()">
      Something happened
      @if (withActions()) {
        <button alert-actions type="button">Retry</button>
      }
    </lib-alert>
  `,
})
class HostComponent {
  readonly tone = signal<AlertTone>('info');
  readonly heading = signal<string | null>(null);
  readonly withActions = signal(false);
}

describe('AlertComponent', () => {
  let spectator: Spectator<HostComponent>;
  const createComponent = createComponentFactory(HostComponent);

  const alert = () => spectator.query('lib-alert') as HTMLElement;

  beforeEach(() => (spectator = createComponent()));

  it('defaults to the info tone', () => {
    expect(alert().classList).toContain('alert');
    expect(alert().classList).toContain('alert--info');
  });

  it.each<AlertTone>(['danger', 'success', 'warning', 'info'])(
    'reflects the %s tone',
    (tone) => {
      spectator.component.tone.set(tone);
      spectator.detectChanges();

      expect(alert().classList).toContain(`alert--${tone}`);
    },
  );

  it('interrupts the screen reader only for danger', () => {
    // role="alert" is assertive; using it for a success message would talk over
    // whatever the user is currently reading.
    spectator.component.tone.set('danger');
    spectator.detectChanges();
    expect(alert().getAttribute('role')).toBe('alert');

    for (const tone of ['success', 'warning', 'info'] as AlertTone[]) {
      spectator.component.tone.set(tone);
      spectator.detectChanges();
      expect(alert().getAttribute('role')).toBe('status');
    }
  });

  it('renders an icon for every tone', () => {
    for (const tone of [
      'danger',
      'success',
      'warning',
      'info',
    ] as AlertTone[]) {
      spectator.component.tone.set(tone);
      spectator.detectChanges();

      expect(alert().querySelector('lib-icon svg')).toBeTruthy();
    }
  });

  it('projects its body', () => {
    expect(spectator.query('.alert__body')?.textContent).toContain(
      'Something happened',
    );
  });

  it('omits the heading element when no heading is given', () => {
    expect(spectator.query('.alert__heading')).toBeNull();

    spectator.component.heading.set('Could not load');
    spectator.detectChanges();

    expect(spectator.query('.alert__heading')?.textContent).toContain(
      'Could not load',
    );
  });

  it('projects actions into their own slot', () => {
    expect(spectator.query('.alert__actions')?.textContent?.trim()).toBe('');

    spectator.component.withActions.set(true);
    spectator.detectChanges();

    expect(spectator.query('.alert__actions')?.textContent).toContain('Retry');
  });
});
