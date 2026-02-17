import * as fromRouter from '@ngrx/router-store';
import { Action, ActionReducer, ActionReducerMap, MetaReducer } from '@ngrx/store';
import { RouterStateUrl } from '@libs/entity';
import { localStorageSync } from 'ngrx-store-localstorage';

export interface State {
  routerReducer: fromRouter.RouterReducerState<RouterStateUrl>;
}

export const reducers: ActionReducerMap<State> = {
  routerReducer: fromRouter.routerReducer,
};

export function storageSyncReducer<State, A extends Action>(
  reducer: ActionReducer<State, A>
): ActionReducer<State, A> {
  return localStorageSync({
    keys: ['routerReducer', 'SHARED_DATA'],
    rehydrate: true,
    storage: window.localStorage,
  })(reducer);
}

export const metaReducers: MetaReducer<State>[] = [storageSyncReducer];
