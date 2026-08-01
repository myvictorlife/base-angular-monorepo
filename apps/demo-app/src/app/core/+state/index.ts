import * as fromRouter from '@ngrx/router-store';
import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { RouterStateUrl } from '@libs/entity';

export interface State {
  routerReducer: fromRouter.RouterReducerState<RouterStateUrl>;
}

export const reducers: ActionReducerMap<State> = {
  routerReducer: fromRouter.routerReducer,
};

/**
 * Extension point for cross-cutting reducer wrappers (logging, reset-on-logout, ...).
 * Keep state persistence out of here: router state is rebuilt by @ngrx/router-store on
 * every navigation, so rehydrating it only replays a stale URL at bootstrap.
 */
export const metaReducers: MetaReducer<State>[] = [];
