import { Component, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { ButtonComponent, ButtonSize, ButtonVariant } from './button';

/**
 * Hosted rather than created directly: the selector is an attribute on a native
 * element, so there is no `<lib-button>` to instantiate. The host is also what
 * proves the native semantics survive.
 */
@Component({
  imports: [ButtonComponent],
  template: `
    <button
      libButton
      [variant]="variant()"
      [size]="size()"
      [block]="block()"
      [disabled]="disabled()"
    >
      Go
    </button>
    <a libButton href="/somewhere" variant="secondary">Link</a>
  `,
})
class HostComponent {
  // Signals, not plain fields: Angular 22 makes OnPush the default, so a host
  // that mutates a plain property never marks itself dirty and detectChanges()
  // skips it — the binding silently keeps its initial value.
  readonly variant = signal<ButtonVariant>('secondary');
  readonly size = signal<ButtonSize>('md');
  readonly block = signal(false);
  readonly disabled = signal(false);
}

describe('ButtonComponent', () => {
  let spectator: Spectator<HostComponent>;
  const createComponent = createComponentFactory(HostComponent);

  const button = () => spectator.query('button') as HTMLButtonElement;

  beforeEach(() => (spectator = createComponent()));

  it('defaults to the secondary variant at medium size', () => {
    expect(button().classList).toContain('btn');
    expect(button().classList).toContain('btn--secondary');
    expect(button().classList).toContain('btn--md');
  });

  it.each<ButtonVariant>(['primary', 'secondary', 'ghost', 'danger'])(
    'reflects the %s variant as a host class',
    (variant) => {
      spectator.component.variant.set(variant);
      spectator.detectChanges();

      expect(button().classList).toContain(`btn--${variant}`);
    },
  );

  it('carries exactly one variant class at a time', () => {
    spectator.component.variant.set('primary');
    spectator.detectChanges();

    const variantClasses = [...button().classList].filter((c) =>
      ['btn--primary', 'btn--secondary', 'btn--ghost', 'btn--danger'].includes(
        c,
      ),
    );
    expect(variantClasses).toEqual(['btn--primary']);
  });

  it.each<ButtonSize>(['sm', 'md', 'lg'])('reflects the %s size', (size) => {
    spectator.component.size.set(size);
    spectator.detectChanges();

    expect(button().classList).toContain(`btn--${size}`);
  });

  it('toggles btn--block', () => {
    expect(button().classList).not.toContain('btn--block');

    spectator.component.block.set(true);
    spectator.detectChanges();

    expect(button().classList).toContain('btn--block');
  });

  it('keeps the native element and its semantics', () => {
    // The whole reason for an attribute selector: a wrapper component would have
    // to re-expose disabled, type, href and form participation by hand.
    expect(button().tagName).toBe('BUTTON');
    expect(button().textContent?.trim()).toBe('Go');

    spectator.component.disabled.set(true);
    spectator.detectChanges();
    expect(button().disabled).toBe(true);
  });

  it('applies to an anchor without turning it into a button', () => {
    const anchor = spectator.query('a') as HTMLAnchorElement;

    expect(anchor.tagName).toBe('A');
    expect(anchor.getAttribute('href')).toBe('/somewhere');
    expect(anchor.classList).toContain('btn--secondary');
  });
});
