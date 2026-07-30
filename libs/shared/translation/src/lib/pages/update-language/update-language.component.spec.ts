import { Router } from '@angular/router';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import {
  TranslateLoader,
  TranslateService,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { Language } from '@libs/entity';
import { LANGUAGE_STORAGE_KEY } from '../../core/language-storage';
import { UpdateLanguageComponent } from './update-language.component';

class StubTranslateLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<TranslationObject> {
    return of({
      BACK: lang === Language.French ? 'Retour' : 'Back',
      UPDATE_LANGUAGE: { TITLE: 'Language preferences', UPDATE: 'Update language' },
    });
  }
}

describe('UpdateLanguageComponent', () => {
  let spectator: Spectator<UpdateLanguageComponent>;
  let router: Router;

  const createComponent = createComponentFactory({
    component: UpdateLanguageComponent,
    providers: [
      { provide: Router, useValue: { navigate: jest.fn() } },
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: Language.English,
        fallbackLang: Language.English,
      }),
    ],
  });

  beforeEach(() => {
    localStorage.clear();
    spectator = createComponent();
    router = spectator.inject(Router);
    spectator.detectChanges();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should preselect the stored language, defaulting to English', () => {
    expect(spectator.component.languageForm.get('language')?.value).toBe(Language.English);
  });

  it('should render translated labels', () => {
    expect(spectator.query('h1')?.textContent).toContain('Language preferences');
  });

  it('should persist and activate the chosen language on submit', () => {
    spectator.component.languageForm.get('language')?.setValue(Language.French);
    spectator.component.confirmLanguageSelection();

    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(Language.French);
    expect(spectator.inject(TranslateService).getCurrentLang()).toBe(Language.French);
  });

  it('should navigate home on goBack', () => {
    spectator.component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
