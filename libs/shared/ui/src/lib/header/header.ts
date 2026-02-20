import { Component } from '@angular/core';
import { TranslationLibModule } from '@libs/translation';

@Component({
  selector: 'lib-header',
  imports: [TranslationLibModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {}
