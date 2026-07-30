import { inject, Injectable } from '@angular/core';
import { Language } from '@libs/entity';
import { TranslateService } from '@ngx-translate/core';
import { LANGUAGE_STORAGE_KEY } from './language-storage';

@Injectable({ providedIn: 'root' })
export class UpdateLanguageService {
  private readonly translate = inject(TranslateService);

  /**
   * Active language as a signal. ngx-translate v18 owns this state, so there is
   * nothing to mirror manually or unsubscribe from.
   */
  readonly currentLanguage = this.translate.currentLang;

  changeLanguage(language: Language): void {
    this.translate.use(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }
}
