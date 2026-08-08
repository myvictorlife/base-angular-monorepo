import { Component, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { CardComponent, CardPadding } from './card';

@Component({
  imports: [CardComponent],
  template: `
    <lib-card [padding]="padding()" [elevated]="elevated()">
      @if (withHeader()) {
        <span card-header>Title</span>
      }
      Body content
      @if (withFooter()) {
        <span card-footer>Actions</span>
      }
    </lib-card>
  `,
})
class HostComponent {
  readonly padding = signal<CardPadding>('md');
  readonly elevated = signal(false);
  readonly withHeader = signal(false);
  readonly withFooter = signal(false);
}

describe('CardComponent', () => {
  let spectator: Spectator<HostComponent>;
  const createComponent = createComponentFactory(HostComponent);

  const card = () => spectator.query('lib-card') as HTMLElement;

  beforeEach(() => (spectator = createComponent()));

  it('defaults to medium padding and no elevation', () => {
    expect(card().classList).toContain('card');
    expect(card().classList).toContain('card--pad-md');
    expect(card().classList).not.toContain('card--elevated');
  });

  it.each<CardPadding>(['none', 'sm', 'md', 'lg'])(
    'reflects %s padding',
    (padding) => {
      spectator.component.padding.set(padding);
      spectator.detectChanges();

      expect(card().classList).toContain(`card--pad-${padding}`);
    },
  );

  it('toggles elevation', () => {
    spectator.component.elevated.set(true);
    spectator.detectChanges();

    expect(card().classList).toContain('card--elevated');
  });

  it('always projects the body', () => {
    expect(spectator.query('.card__body')?.textContent).toContain(
      'Body content',
    );
  });

  it('leaves the header and footer slots empty when nothing is projected', () => {
    // `:empty` in the stylesheet collapses them; that only works if Angular does
    // not put stray content in the slot.
    expect(spectator.query('.card__header')?.textContent?.trim()).toBe('');
    expect(spectator.query('.card__footer')?.textContent?.trim()).toBe('');
  });

  it('fills the header and footer slots when given content', () => {
    spectator.component.withHeader.set(true);
    spectator.component.withFooter.set(true);
    spectator.detectChanges();

    expect(spectator.query('.card__header')?.textContent).toContain('Title');
    expect(spectator.query('.card__footer')?.textContent).toContain('Actions');
  });
});
