import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '@libs/environment';
import { HeaderComponent } from '@libs/ui';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [RouterLink, HeaderComponent, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {

  private readonly router = inject(Router);

  readonly environmentName = signal(environment.environmentName);

  viewProfile(): void {
    this.router.navigate(['/profile']);
  }

}
