import { createReducer, on } from '@ngrx/store';
import { IGenericError, RouterStateUrl } from '@libs/entity';
import { User } from '@libs/entity';
import * as fromActions from './shared-data.actions';

export const sharedDataStateFeatureKey = 'SHARED_DATA';

export interface SharedDataState {
  loading: boolean;
  error?: IGenericError;
  routerState?: RouterStateUrl;
  profile?: User;
}

export const initialState: SharedDataState = {
  loading: false,
  routerState: undefined,
  profile: undefined,
};

export const reducer = createReducer(
  initialState,
  on(fromActions.setProfile, (state, { profile }) => ({
    ...state,
    profile,
  })),
);
