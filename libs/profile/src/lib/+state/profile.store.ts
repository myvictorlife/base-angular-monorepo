import { computed, inject } from '@angular/core';
import { IGenericError, User } from '@libs/entity';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { ProfileService } from '../services/profile/profile.service';

export interface ProfileState {
  profile: User | null;
  loading: boolean;
  error: IGenericError | null;
}

export const initialProfileState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
};

/**
 * Feature state for the profile page.
 *
 * Provided on the profile route (see `user.routes.ts`), never in root: the store
 * is created when the feature is entered and torn down when it is left. The
 * profile is a single object, so it is a plain state field — `withEntities` is
 * for collections and would only add indirection here.
 */
export const ProfileStore = signalStore(
  withState(initialProfileState),
  withComputed(({ profile, error }) => ({
    hasProfile: computed(() => profile() !== null),
    errorMessage: computed(() => error()?.message ?? null),
  })),
  withMethods((store, profileService = inject(ProfileService)) => ({
    /**
     * `switchMap` cancels an in-flight request when a newer one starts, so a slow
     * response can never overwrite a fresher one. `tapResponse` keeps the stream
     * alive after a failure — without it the first error would kill the rxMethod
     * and every later call would be silently ignored.
     */
    fetchProfile: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          profileService.fetchProfile().pipe(
            tapResponse({
              next: (profile) => patchState(store, { profile, loading: false }),
              error: (error: IGenericError) =>
                patchState(store, { error, loading: false }),
            }),
          ),
        ),
      ),
    ),
  })),
);
