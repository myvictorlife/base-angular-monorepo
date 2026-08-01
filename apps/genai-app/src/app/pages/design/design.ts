import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AlertComponent,
  AlertTone,
  BadgeComponent,
  BadgeTone,
  BadgeVariant,
  ButtonComponent,
  ButtonSize,
  ButtonVariant,
  CardComponent,
  HeaderComponent,
  ICON_NAMES,
  IconComponent,
  IconName,
  SpinnerComponent,
  SpinnerSize,
} from '@libs/ui';
import { TranslatePipe } from '@ngx-translate/core';

interface Swatch {
  /** CSS custom property name, rendered as the label. */
  token: string;
  /** Set when the swatch needs a contrasting foreground drawn on top. */
  on?: string;
}

/**
 * Living catalogue of the design system.
 *
 * Everything is driven off these arrays, so a new token needs one entry here and
 * nothing else — and because each swatch renders `var(--token)` rather than a
 * copied value, the page can never drift from the real tokens. Flip the theme
 * toggle in the header to see every entry retheme at once.
 */
@Component({
  selector: 'app-design',
  imports: [
    AlertComponent,
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    HeaderComponent,
    IconComponent,
    SpinnerComponent,
    TranslatePipe,
  ],
  templateUrl: './design.html',
  styleUrl: './design.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DesignPage {
  readonly surfaces: Swatch[] = [
    { token: '--color-bg-base', on: '--color-text-primary' },
    { token: '--color-bg-surface', on: '--color-text-primary' },
    { token: '--color-bg-elevated', on: '--color-text-primary' },
    { token: '--color-bg-hover', on: '--color-text-primary' },
    { token: '--color-bg-inverted', on: '--color-text-inverted' },
  ];

  readonly brand: Swatch[] = [
    { token: '--color-brand', on: '--color-text-on-brand' },
    { token: '--color-brand-hover', on: '--color-text-on-brand' },
    { token: '--color-brand-subtle', on: '--color-text-primary' },
  ];

  readonly text: Swatch[] = [
    { token: '--color-text-primary' },
    { token: '--color-text-secondary' },
    { token: '--color-text-muted' },
  ];

  readonly borders: Swatch[] = [
    { token: '--color-border' },
    { token: '--color-border-strong' },
  ];

  readonly status: { token: string; bg: string }[] = [
    { token: '--color-danger', bg: '--color-danger-bg' },
    { token: '--color-success', bg: '--color-success-bg' },
    { token: '--color-warning', bg: '--color-warning-bg' },
    { token: '--color-info', bg: '--color-info-bg' },
  ];

  readonly fontSizes = [
    '--font-size-xs',
    '--font-size-sm',
    '--font-size-base',
    '--font-size-lg',
    '--font-size-xl',
    '--font-size-2xl',
    '--font-size-3xl',
    '--font-size-4xl',
    '--font-size-5xl',
  ];

  readonly spacing = [
    '--space-1',
    '--space-2',
    '--space-3',
    '--space-4',
    '--space-6',
    '--space-8',
    '--space-12',
    '--space-16',
  ];

  readonly radii = ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-full'];

  readonly shadows = ['--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-xl'];

  /* ── Components ── */

  readonly buttonVariants: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
  readonly buttonSizes: ButtonSize[] = ['sm', 'md', 'lg'];

  readonly badgeTones: BadgeTone[] = ['neutral', 'brand', 'danger', 'success', 'warning', 'info'];
  readonly badgeVariants: BadgeVariant[] = ['solid', 'soft', 'outline'];

  readonly alertTones: AlertTone[] = ['info', 'success', 'warning', 'danger'];

  readonly spinnerSizes: SpinnerSize[] = ['sm', 'md', 'lg'];

  /** Straight from the icon set, so the catalogue can never fall behind it. */
  readonly iconNames: readonly IconName[] = ICON_NAMES;
}
