import { User } from '@libs/entity';
import { initialState, sharedDataStateFeatureKey } from './shared-data.reducer';
import { selectDataSharedState, selectProfile } from './shared-data.selectors';

const user: User = { id: '1', name: 'Ada Lovelace' };

describe('shared-data selectors', () => {
  it('selectDataSharedState returns the slice', () => {
    const state = { [sharedDataStateFeatureKey]: initialState };

    expect(selectDataSharedState(state)).toEqual(initialState);
  });

  it('selectProfile returns the stored profile', () => {
    const state = { [sharedDataStateFeatureKey]: { ...initialState, profile: user } };

    expect(selectProfile(state)).toEqual(user);
  });

  it('selectProfile returns undefined when no profile is set', () => {
    const state = { [sharedDataStateFeatureKey]: initialState };

    expect(selectProfile(state)).toBeUndefined();
  });

  it('selectProfile tolerates an absent slice', () => {
    expect(selectProfile({ [sharedDataStateFeatureKey]: undefined } as never)).toBeUndefined();
  });
});
