import { User } from '@libs/entity';
import { adapter, initialState, profileFeatureKey } from './profile.reducer';
import { selectLoading, selectProfile, selectProfileList } from './profile.selectors';

const ada: User = { id: '1', name: 'Ada Lovelace' };
const grace: User = { id: '2', name: 'Grace Hopper' };

const stateWith = (users: User[], overrides: Partial<typeof initialState> = {}) => ({
  [profileFeatureKey]: adapter.setAll(users, { ...initialState, ...overrides }),
});

describe('profile selectors', () => {
  it('selectProfileList returns every entity', () => {
    expect(selectProfileList(stateWith([ada, grace]))).toEqual([ada, grace]);
  });

  it('selectProfile returns the first entity', () => {
    expect(selectProfile(stateWith([ada, grace]))).toEqual(ada);
  });

  it('selectProfile returns null when there is no profile', () => {
    expect(selectProfile(stateWith([]))).toBeNull();
  });

  it('selectLoading reflects the flag', () => {
    expect(selectLoading(stateWith([], { loading: true }))).toBe(true);
    expect(selectLoading(stateWith([]))).toBe(false);
  });

  it('selectLoading falls back to false when the slice is absent', () => {
    expect(selectLoading({ [profileFeatureKey]: undefined } as never)).toBe(false);
  });
});
