import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { Profile } from './profile';
import { Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { TranslateLoader, TranslationObject, provideTranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { provideProfileState } from '../../+state/profile/profile.providers';

/** Serves the strings the template needs without touching HTTP. */
class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({
      PROFILE: { TITLE: 'Profile', BACK_HOME: 'Back to Home' },
      USER_INFO: { USER_ID: 'User ID' },
    });
  }
}

describe('Profile', () => {
  let spectator: Spectator<Profile>;
  let router: Router;
  const createComponent = createComponentFactory({
    component: Profile,
    providers: [
      {
        provide: Router,
        useValue: { navigate: jest.fn() },
      },
      provideHttpClient(),
      provideStore({}),
      provideEffects(),
      // The feature slice now lives on the profile route, so a component-level
      // test has to register it explicitly.
      provideProfileState(),
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: 'en',
        fallbackLang: 'en',
      }),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    router = spectator.inject(Router);
    spectator.detectChanges();
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should render Back to Home button', () => {
    const button = spectator.query('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Back to Home');
  });

  it('should call goHome when Back to Home button is clicked', () => {
    const spy = jest.spyOn(spectator.component, 'goHome');
    spectator.click('button');
    expect(spy).toHaveBeenCalled();
  });

  it('should navigate to home when goHome is called', () => {
    spectator.component.goHome();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
