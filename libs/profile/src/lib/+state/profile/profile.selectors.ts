import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromReducer from './profile.reducer';

export const selectProfileState = createFeatureSelector<fromReducer.State>(
  fromReducer.profileFeatureKey
);

export const selectLoading = createSelector(
  selectProfileState,
  (state) => state?.loading ?? false
);

export const selectProfileList = createSelector(
  selectProfileState,
  fromReducer.selectAll
);

export const selectProfile = createSelector(
  selectProfileList,
  (profile) => profile?.[0] ?? null
);

