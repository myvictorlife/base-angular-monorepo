import { IGenericError, User } from '@libs/entity';
import * as fromActions from './profile.actions';
import { initialState, reducer, selectAll } from './profile.reducer';

const user: User = { id: '1', name: 'Ada Lovelace' };
const error: IGenericError = { message: 'boom', code: 'E_BOOM', status: 500 };

describe('profile reducer', () => {
  it('starts empty, not loading, without error', () => {
    expect(selectAll(initialState)).toEqual([]);
    expect(initialState.loading).toBe(false);
    expect(initialState.error).toBeNull();
  });

  it('flags loading and clears a previous error on fetchProfile', () => {
    const errored = reducer(initialState, fromActions.fetchProfileFailed({ error }));

    const state = reducer(errored, fromActions.fetchProfile());

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('stores the user and stops loading on success', () => {
    const state = reducer(initialState, fromActions.fetchProfileSuccess({ response: user }));

    expect(selectAll(state)).toEqual([user]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('keys entities by user id, so refetching the same user does not duplicate it', () => {
    let state = reducer(initialState, fromActions.fetchProfileSuccess({ response: user }));
    state = reducer(state, fromActions.fetchProfileSuccess({ response: user }));

    expect(selectAll(state)).toHaveLength(1);
  });

  it('records the error and stops loading on failure', () => {
    const loading = reducer(initialState, fromActions.fetchProfile());

    const state = reducer(loading, fromActions.fetchProfileFailed({ error }));

    expect(state.loading).toBe(false);
    expect(state.error).toEqual(error);
  });

  it('does not mutate the previous state', () => {
    const before = reducer(initialState, fromActions.fetchProfileSuccess({ response: user }));
    const snapshot = JSON.stringify(before);

    reducer(before, fromActions.fetchProfileFailed({ error }));

    expect(JSON.stringify(before)).toBe(snapshot);
  });
});
