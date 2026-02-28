import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { environment } from '@libs/environment';
import { User } from '@libs/entity';
import { HeaderComponent } from '@libs/ui';
import { TranslationLibModule } from '@libs/translation';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, HeaderComponent, TranslationLibModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {

  private readonly router = inject(Router);

  environmentName = signal(environment.environmentName);

  userInfo = signal<User>({
    id: '123',
    name: 'John Doe'
  });

  viewProfile() {
    this.router.navigate(['/profile']);
  }

}
