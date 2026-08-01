import { Component, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { ICON_NAMES, IconComponent, IconName, IconSize } from './icon';

@Component({
  imports: [IconComponent],
  template: `<lib-icon [name]="name()" [size]="size()" [label]="label()" />`,
})
class HostComponent {
  readonly name = signal<IconName>('check');
  readonly size = signal<IconSize>('md');
  readonly label = signal<string | null>(null);
}

describe('IconComponent', () => {
  let spectator: Spectator<HostComponent>;
  const createComponent = createComponentFactory(HostComponent);

  const icon = () => spectator.query('lib-icon') as HTMLElement;

  beforeEach(() => (spectator = createComponent()));

  it('renders an svg for every name in the set', () => {
    // Guards the pairing the component depends on: a name added to ICON_NAMES
    // without a matching @case would render an empty <svg>.
    for (const name of ICON_NAMES) {
      spectator.component.name.set(name);
      spectator.detectChanges();

      const paths = icon().querySelectorAll('svg path, svg circle');
      expect(paths.length).toBeGreaterThan(0);
    }
  });

  it.each<IconSize>(['sm', 'md', 'lg'])('reflects the %s size', (size) => {
    spectator.component.size.set(size);
    spectator.detectChanges();

    expect(icon().classList).toContain(`icon--${size}`);
  });

  it('is hidden from assistive tech by default', () => {
    // Icons are decorative unless they are the only content of a control.
    expect(icon().getAttribute('aria-hidden')).toBe('true');
    expect(icon().getAttribute('role')).toBeNull();
  });

  it('becomes an image with a name when labelled', () => {
    spectator.component.label.set('Close dialog');
    spectator.detectChanges();

    expect(icon().getAttribute('aria-hidden')).toBeNull();
    expect(icon().getAttribute('role')).toBe('img');
    expect(icon().getAttribute('aria-label')).toBe('Close dialog');
  });

  it('exposes a non-empty, duplicate-free name set', () => {
    expect(ICON_NAMES.length).toBeGreaterThan(0);
    expect(new Set(ICON_NAMES).size).toBe(ICON_NAMES.length);
  });
});
