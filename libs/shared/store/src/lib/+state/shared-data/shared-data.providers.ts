import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { provideState } from '@ngrx/store';
import * as fromReducer from './shared-data.reducer';

/** Registers the shared-data slice. Add once in the application config. */
export function provideSharedDataState(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideState(fromReducer.sharedDataStateFeatureKey, fromReducer.reducer),
  ]);
}
