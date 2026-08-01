import { Component, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { BadgeComponent, BadgeTone, BadgeVariant } from './badge';

const TONES: BadgeTone[] = [
  'neutral',
  'brand',
  'danger',
  'success',
  'warning',
  'info',
];
const VARIANTS: BadgeVariant[] = ['solid', 'soft', 'outline'];

@Component({
  imports: [BadgeComponent],
  template: `<lib-badge [tone]="tone()" [variant]="variant()" [pill]="pill()"
    >42</lib-badge
  >`,
})
class HostComponent {
  readonly tone = signal<BadgeTone>('neutral');
  readonly variant = signal<BadgeVariant>('soft');
  readonly pill = signal(false);
}

describe('BadgeComponent', () => {
  let spectator: Spectator<HostComponent>;
  const createComponent = createComponentFactory(HostComponent);

  const badge = () => spectator.query('lib-badge') as HTMLElement;

  beforeEach(() => (spectator = createComponent()));

  it('defaults to the neutral soft badge', () => {
    expect(badge().classList).toContain('badge');
    expect(badge().classList).toContain('badge--neutral');
    expect(badge().classList).toContain('badge--soft');
  });

  it('projects its content', () => {
    expect(badge().textContent?.trim()).toBe('42');
  });

  it.each(TONES)('reflects the %s tone', (tone) => {
    spectator.component.tone.set(tone);
    spectator.detectChanges();

    expect(badge().classList).toContain(`badge--${tone}`);
  });

  it.each(VARIANTS)('reflects the %s variant', (variant) => {
    spectator.component.variant.set(variant);
    spectator.detectChanges();

    expect(badge().classList).toContain(`badge--${variant}`);
  });

  it('combines tone and variant independently', () => {
    spectator.component.tone.set('danger');
    spectator.component.variant.set('outline');
    spectator.detectChanges();

    expect(badge().classList).toContain('badge--danger');
    expect(badge().classList).toContain('badge--outline');
  });

  it('toggles the pill shape', () => {
    expect(badge().classList).not.toContain('badge--pill');

    spectator.component.pill.set(true);
    spectator.detectChanges();

    expect(badge().classList).toContain('badge--pill');
  });
});
