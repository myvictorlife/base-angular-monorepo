import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { IGenericError, User } from '@libs/entity';
import { Observable, of, throwError } from 'rxjs';
import { ProfileService } from '../../services/profile/profile.service';
import * as fromActions from './profile.actions';
import { ProfileEffects } from './profile.effects';

const user: User = { id: '1', name: 'Ada Lovelace' };
const error: IGenericError = { message: 'boom', code: 'E_BOOM', status: 500 };

describe('ProfileEffects', () => {
  let actions$: Observable<unknown>;
  let profileService: { fetchProfile: jest.Mock };

  const setup = () => {
    profileService = { fetchProfile: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        ProfileEffects,
        provideMockActions(() => actions$),
        { provide: ProfileService, useValue: profileService },
      ],
    });
    return TestBed.inject(ProfileEffects);
  };

  it('maps a successful fetch to fetchProfileSuccess', (done) => {
    actions$ = of(fromActions.fetchProfile());
    const effects = setup();
    profileService.fetchProfile.mockReturnValue(of(user));

    effects.fetchProfile$.subscribe((result) => {
      expect(result).toEqual(fromActions.fetchProfileSuccess({ response: user }));
      done();
    });
  });

  it('maps a failing fetch to fetchProfileFailed instead of erroring the stream', (done) => {
    actions$ = of(fromActions.fetchProfile());
    const effects = setup();
    profileService.fetchProfile.mockReturnValue(throwError(() => error));

    effects.fetchProfile$.subscribe({
      next: (result) => {
        expect(result).toEqual(fromActions.fetchProfileFailed({ error }));
        done();
      },
      error: () => done.fail('the effect must not propagate the error'),
    });
  });

  it('ignores actions it does not handle', (done) => {
    actions$ = of(fromActions.fetchProfileSuccess({ response: user }));
    const effects = setup();
    const next = jest.fn();

    effects.fetchProfile$.subscribe({ next, complete: () => {
      expect(next).not.toHaveBeenCalled();
      expect(profileService.fetchProfile).not.toHaveBeenCalled();
      done();
    } });
  });
});
