import { Router } from '@angular/router';
import { IGenericError, User } from '@libs/entity';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, Subject, of, throwError } from 'rxjs';
import { ProfileStore } from '../../+state/profile.store';
import { ProfileService } from '../../services/profile/profile.service';
import { Profile } from './profile';

const user: User = { id: '123', name: 'John Doe' };
const error: IGenericError = {
  message: 'network down',
  code: 'E_NET',
  status: 503,
};

/** Serves the strings the template needs without touching HTTP. */
class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({
      PROFILE: {
        TITLE: 'Profile',
        BACK_HOME: 'Back to Home',
        LOADING: 'Loading profile...',
        ERROR: 'Could not load the profile',
        RETRY: 'Try again',
      },
      USER_INFO: { USER_ID: 'User ID' },
    });
  }
}

describe('Profile', () => {
  let spectator: Spectator<Profile>;
  let router: Router;
  // Shared so a test can decide what the service answers before the component
  // is created — the component fetches in its constructor.
  const profileService = { fetchProfile: vi.fn() };

  const createComponent = createComponentFactory({
    component: Profile,
    providers: [
      { provide: Router, useValue: { navigate: vi.fn() } },
      { provide: ProfileService, useValue: profileService },
      // The store is normally provided by the profile route, so a component-level
      // test has to register it explicitly. No root store, no effects runner.
      ProfileStore,
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: 'en',
        fallbackLang: 'en',
      }),
    ],
  });

  /** Creates the component after the service stub has been configured. */
  const render = () => {
    spectator = createComponent();
    router = spectator.inject(Router);
    spectator.detectChanges();
    return spectator;
  };

  beforeEach(() => {
    profileService.fetchProfile.mockReset();
    profileService.fetchProfile.mockReturnValue(of(user));
  });

  it('should create', () => {
    expect(render().component).toBeTruthy();
  });

  it('should render Back to Home button', () => {
    const button = render().query('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Back to Home');
  });

  it('should call goHome when Back to Home button is clicked', () => {
    render();
    const spy = vi.spyOn(spectator.component, 'goHome');
    spectator.click('button');
    expect(spy).toHaveBeenCalled();
  });

  it('should navigate to home when goHome is called', () => {
    render();
    spectator.component.goHome();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('fetches the profile on creation and renders it', () => {
    render();

    expect(profileService.fetchProfile).toHaveBeenCalledTimes(1);
    expect(spectator.query('lib-user-info')).toBeTruthy();
    expect(spectator.query('lib-user-info')?.textContent).toContain('John Doe');
  });

  it('shows the loading state while the request is in flight', () => {
    profileService.fetchProfile.mockReturnValue(new Subject<User>());
    render();

    expect(spectator.query('[role="status"]')?.textContent).toContain(
      'Loading profile...',
    );
    expect(spectator.query('lib-user-info')).toBeFalsy();
  });

  it('shows the error message and a retry button when the fetch fails', () => {
    profileService.fetchProfile.mockReturnValue(throwError(() => error));
    render();

    const alert = spectator.query('[role="alert"]');
    expect(alert?.textContent).toContain('Could not load the profile');
    expect(alert?.textContent).toContain('network down');
    expect(spectator.query('lib-user-info')).toBeFalsy();
  });

  it('refetches when the retry button is clicked', () => {
    profileService.fetchProfile.mockReturnValueOnce(throwError(() => error));
    render();

    spectator.click('[role="alert"] button');
    spectator.detectChanges();

    expect(profileService.fetchProfile).toHaveBeenCalledTimes(2);
    expect(spectator.query('lib-user-info')?.textContent).toContain('John Doe');
  });
});
