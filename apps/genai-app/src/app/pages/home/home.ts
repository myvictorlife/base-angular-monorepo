import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { environment } from '@libs/environment';
import { User } from '@libs/entity';
import { HeaderComponent } from '@libs/ui';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    HeaderComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
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
