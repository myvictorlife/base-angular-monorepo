import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '@libs/environment';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly router = inject(Router);

  readonly environmentName = signal(environment.environmentName);
  /** `null` (no `config/site.json`) removes the GitHub button from the CTA. */
  readonly repoUrl = environment.repoUrl;

  viewProfile(): void {
    this.router.navigate(['/profile']);
  }
}
