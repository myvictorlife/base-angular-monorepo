import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { ProfileService } from '../../services/profile/profile.service';
import { ProfileEffects } from './profile.effects';
import * as fromReducer from './profile.reducer';

/**
 * Registers the profile slice and its effects. Attach to the profile route so the
 * state is only created when the feature is actually entered.
 */
export function provideProfileState(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(fromReducer.profileFeatureKey, fromReducer.reducer),
    provideEffects(ProfileEffects),
    ProfileService,
  ]);
}
