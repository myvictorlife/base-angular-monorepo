import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { environment } from '@libs/environment';
import { HeaderComponent } from '@libs/ui';

@Component({
  imports: [RouterModule, HeaderComponent],
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
})
export class App {
  protected title = 'demo-app';
  protected readonly repoUrl = environment.repoUrl;
}
