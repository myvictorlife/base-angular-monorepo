import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { environment } from '@genai/environment';
import { User } from '@genai-context-orchestrator-app/entity';
import { HeaderComponent } from '@genai-context-orchestrator-app/ui';

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

  environmentName = signal(environment.environmentName);

  userInfo = signal<User>({
    id: '123',
    name: 'John Doe'
  });

}
