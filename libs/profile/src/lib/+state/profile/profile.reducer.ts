import { IGenericError, User } from '@libs/entity';
import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import * as fromActions from './profile.actions';

export const profileFeatureKey = 'profile';

export interface State extends EntityState<User> {
  loading: boolean;
  error: IGenericError | null;
}

export const adapter: EntityAdapter<User> =
  createEntityAdapter<User>({
    selectId: (user) => user.id,
  });

export const initialState: State = adapter.getInitialState({
  loading: false,
  error: null
});

export const reducer = createReducer(
  initialState,
  on(fromActions.fetchProfile, (state) => ({
      ...state,
      loading: true,
      error: null,
    })),
  on(
    fromActions.fetchProfileSuccess,
    (state, { response }) => 
    adapter.addOne(response, {
      ...state,
      loading: false,
      error: null,
    })
  ),
  on(fromActions.fetchProfileFailed, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);

export const { selectAll } = adapter.getSelectors();
