import { TestBed } from '@angular/core/testing';
import { IGenericError, User } from '@libs/entity';
import { Subject, of, throwError } from 'rxjs';
import { ProfileService } from '../services/profile/profile.service';
import { ProfileStore, initialProfileState } from './profile.store';

const user: User = { id: '1', name: 'Ada Lovelace' };
const error: IGenericError = { message: 'boom', code: 'E_BOOM', status: 500 };

describe('ProfileStore', () => {
  let profileService: { fetchProfile: jest.Mock };

  const setup = () => {
    profileService = { fetchProfile: jest.fn().mockReturnValue(of(user)) };
    TestBed.configureTestingModule({
      providers: [
        ProfileStore,
        { provide: ProfileService, useValue: profileService },
      ],
    });
    return TestBed.inject(ProfileStore);
  };

  it('starts empty, idle and without an error', () => {
    const store = setup();

    expect(store.profile()).toBe(initialProfileState.profile);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.hasProfile()).toBe(false);
    expect(store.errorMessage()).toBeNull();
  });

  it('stores the profile on a successful fetch', () => {
    const store = setup();

    store.fetchProfile();

    expect(store.profile()).toEqual(user);
    expect(store.hasProfile()).toBe(true);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('flags loading while the request is in flight', () => {
    const store = setup();
    const response = new Subject<User>();
    profileService.fetchProfile.mockReturnValue(response);

    store.fetchProfile();
    expect(store.loading()).toBe(true);

    response.next(user);
    expect(store.loading()).toBe(false);
  });

  it('stores the error and clears loading on a failed fetch', () => {
    const store = setup();
    profileService.fetchProfile.mockReturnValue(throwError(() => error));

    store.fetchProfile();

    expect(store.error()).toEqual(error);
    expect(store.errorMessage()).toBe('boom');
    expect(store.loading()).toBe(false);
    expect(store.profile()).toBeNull();
  });

  it('stays usable after a failure so a retry can succeed', () => {
    const store = setup();
    profileService.fetchProfile.mockReturnValueOnce(throwError(() => error));

    store.fetchProfile();
    store.fetchProfile();

    expect(profileService.fetchProfile).toHaveBeenCalledTimes(2);
    expect(store.profile()).toEqual(user);
    expect(store.error()).toBeNull();
  });

  it('replaces a previously loaded profile on refetch', () => {
    const store = setup();
    store.fetchProfile();

    const updated: User = { id: '1', name: 'Ada L.' };
    profileService.fetchProfile.mockReturnValue(of(updated));
    store.fetchProfile();

    expect(store.profile()).toEqual(updated);
  });

  it('keeps only the latest response when requests overlap', () => {
    const store = setup();
    const first = new Subject<User>();
    const second = new Subject<User>();

    profileService.fetchProfile.mockReturnValueOnce(first).mockReturnValueOnce(second);
    store.fetchProfile();
    store.fetchProfile();

    // switchMap unsubscribed from the first request, so a late answer is ignored.
    first.next({ id: '9', name: 'Stale' });
    second.next(user);

    expect(store.profile()).toEqual(user);
  });
});
