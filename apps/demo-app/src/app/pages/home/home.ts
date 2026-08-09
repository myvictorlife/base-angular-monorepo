import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '@libs/environment';
import {
  BadgeComponent,
  ButtonComponent,
  CardComponent,
  IconComponent,
} from '@libs/ui';
import { TranslatePipe } from '@ngx-translate/core';

interface NumberedItem {
  step: number;
  titleKey: string;
  descKey: string;
}

@Component({
  selector: 'app-home',
  imports: [
    BadgeComponent,
    ButtonComponent,
    CardComponent,
    IconComponent,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly router = inject(Router);

  readonly environmentName = signal(environment.environmentName);
  /** `null` (no `config/site.json`) removes the GitHub button from the CTA. */
  readonly repoUrl = environment.repoUrl;

  readonly valueProps: NumberedItem[] = [
    { step: 1, titleKey: 'HOME.VALUE_1_TITLE', descKey: 'HOME.VALUE_1_DESC' },
    { step: 2, titleKey: 'HOME.VALUE_2_TITLE', descKey: 'HOME.VALUE_2_DESC' },
    { step: 3, titleKey: 'HOME.VALUE_3_TITLE', descKey: 'HOME.VALUE_3_DESC' },
  ];

  readonly howSteps: NumberedItem[] = [
    { step: 1, titleKey: 'HOME.HOW_1_TITLE', descKey: 'HOME.HOW_1_DESC' },
    { step: 2, titleKey: 'HOME.HOW_2_TITLE', descKey: 'HOME.HOW_2_DESC' },
    { step: 3, titleKey: 'HOME.HOW_3_TITLE', descKey: 'HOME.HOW_3_DESC' },
  ];

  /** `highlight` maps to the solid badge; the rest render soft. */
  readonly stack: { labelKey: string; highlight: boolean }[] = [
    { labelKey: 'HOME.STACK_ATOMIC', highlight: true },
    { labelKey: 'HOME.STACK_ANGULAR', highlight: true },
    { labelKey: 'HOME.STACK_FIREBASE', highlight: true },
    { labelKey: 'HOME.STACK_ANALYTICS', highlight: true },
    { labelKey: 'HOME.STACK_NGRX', highlight: false },
    { labelKey: 'HOME.STACK_NX', highlight: false },
    { labelKey: 'HOME.STACK_TAILWIND', highlight: false },
  ];

  readonly docs = [
    'HOME.DOCS_BEST_PRACTICES',
    'HOME.DOCS_GENERATORS',
    'HOME.DOCS_SKILLS',
  ];

  viewProfile(): void {
    this.router.navigate(['/profile']);
  }
}
