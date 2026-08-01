import { Component, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { SpinnerComponent, SpinnerSize } from './spinner';

@Component({
  imports: [SpinnerComponent],
  template: `<lib-spinner [size]="size()" [label]="label()" />`,
})
class HostComponent {
  readonly size = signal<SpinnerSize>('md');
  readonly label = signal('Loading');
}

describe('SpinnerComponent', () => {
  let spectator: Spectator<HostComponent>;
  const createComponent = createComponentFactory(HostComponent);

  const spinner = () => spectator.query('lib-spinner') as HTMLElement;

  beforeEach(() => (spectator = createComponent()));

  it('defaults to medium', () => {
    expect(spinner().classList).toContain('spinner');
    expect(spinner().classList).toContain('spinner--md');
  });

  it.each<SpinnerSize>(['sm', 'md', 'lg'])('reflects the %s size', (size) => {
    spectator.component.size.set(size);
    spectator.detectChanges();

    expect(spinner().classList).toContain(`spinner--${size}`);
  });

  it('announces the wait instead of spinning silently', () => {
    expect(spinner().getAttribute('role')).toBe('status');
    expect(spinner().getAttribute('aria-label')).toBe('Loading');
  });

  it('takes a caller-supplied label so it can be translated', () => {
    spectator.component.label.set('Carregando perfil');
    spectator.detectChanges();

    expect(spinner().getAttribute('aria-label')).toBe('Carregando perfil');
  });
});
