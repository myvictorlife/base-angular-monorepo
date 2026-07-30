import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

/** Appended after the page title, e.g. "Profile · Base App". */
export const APP_TITLE = 'Base App';

/**
 * Treats a route's `title` as an i18n key and keeps `<title>` translated.
 *
 * Angular's default strategy writes the raw route title, which for a translated
 * app means shipping the key itself. Routes without a title fall back to the
 * app name alone.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly translate = inject(TranslateService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.title.setTitle(this.resolve(this.buildTitle(snapshot)));
  }

  /** Public so callers (e.g. analytics) can report the same string the user sees. */
  resolve(key: string | undefined): string {
    if (!key) return APP_TITLE;
    const translated = this.translate.instant(key);
    // `instant` echoes the key back when the bundle has no entry for it.
    return translated === key ? APP_TITLE : `${translated} · ${APP_TITLE}`;
  }
}
