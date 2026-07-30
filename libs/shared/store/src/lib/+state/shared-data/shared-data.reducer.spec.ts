import { User } from '@libs/entity';
import * as fromActions from './shared-data.actions';
import { initialState, reducer } from './shared-data.reducer';

const user: User = { id: '1', name: 'Ada Lovelace' };

describe('shared-data reducer', () => {
  it('starts without a profile and not loading', () => {
    expect(initialState.profile).toBeUndefined();
    expect(initialState.loading).toBe(false);
  });

  it('stores the profile on setProfile', () => {
    const state = reducer(initialState, fromActions.setProfile({ profile: user }));

    expect(state.profile).toEqual(user);
  });

  it('replaces a previously stored profile', () => {
    const first = reducer(initialState, fromActions.setProfile({ profile: user }));
    const second = reducer(first, fromActions.setProfile({ profile: { id: '2', name: 'Grace' } }));

    expect(second.profile).toEqual({ id: '2', name: 'Grace' });
  });

  it('leaves the previous state untouched', () => {
    const snapshot = JSON.stringify(initialState);

    reducer(initialState, fromActions.setProfile({ profile: user }));

    expect(JSON.stringify(initialState)).toBe(snapshot);
  });

  it('returns the same state for an unknown action', () => {
    expect(reducer(initialState, { type: 'noop' } as never)).toBe(initialState);
  });
});
