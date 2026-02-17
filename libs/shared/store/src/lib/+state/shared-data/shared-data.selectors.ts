import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  SharedDataState,
  sharedDataStateFeatureKey,
} from './shared-data.reducer';

export const selectDataSharedState = createFeatureSelector<SharedDataState>(
  sharedDataStateFeatureKey
);

export const selectProfile = createSelector(
  selectDataSharedState,
  (state) => state?.profile
);
