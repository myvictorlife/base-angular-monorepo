import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromRouter from '@ngrx/router-store';
import { RouterStateUrl } from '@libs/entity';

export const selectRouterState =
  createFeatureSelector<fromRouter.RouterReducerState<RouterStateUrl>>(
    'routerReducer'
  );

export const selectCurrentRoute = createSelector(
  selectRouterState,
  (routerState) => routerState
);
