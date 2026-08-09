import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Standard page intro: the `<h1>` plus an optional lead paragraph. One
 * component so every page opens with the same hierarchy instead of each one
 * restyling its own title.
 */
@Component({
  selector: 'lib-page-header',
  imports: [TranslatePipe],
  templateUrl: './page-header.html',
  styleUrl: './page-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
  readonly titleKey = input.required<string>();
  readonly leadKey = input<string | null>(null);
}
