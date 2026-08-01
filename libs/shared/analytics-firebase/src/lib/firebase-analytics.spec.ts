import { TestBed } from '@angular/core/testing';
import { ANALYTICS } from '@libs/analytics';
import { FirebaseAnalytics } from './firebase-analytics';
import { provideFirebaseAnalytics } from './firebase-analytics.providers';

// The SDK is mocked rather than reached: these tests must pass on a fresh clone
// with no Firebase project, and a real `getAnalytics()` needs a browser + network.
const mockLogEvent = jest.fn();
const mockGetAnalytics = jest.fn(() => ({ app: 'stub' }));
const mockIsSupported = jest.fn(async () => true);
const mockInitializeApp = jest.fn();
const mockGetApps = jest.fn(() => [] as unknown[]);

jest.mock('firebase/analytics', () => ({
  getAnalytics: () => mockGetAnalytics(),
  isSupported: () => mockIsSupported(),
  logEvent: (...args: unknown[]) => mockLogEvent(...args),
}));

jest.mock('firebase/app', () => ({
  getApps: () => mockGetApps(),
  initializeApp: (config: unknown) => mockInitializeApp(config),
}));

// Mutable so each test can pick the enabled/disabled path.
const environment = {
  firebaseEnabled: false,
  firebaseConfig: { apiKey: 'stub' },
};
jest.mock('@libs/environment', () => ({
  get environment() {
    return environment;
  },
}));

describe('provideFirebaseAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    environment.firebaseEnabled = false;
    mockIsSupported.mockResolvedValue(true);
    mockGetApps.mockReturnValue([]);
    TestBed.configureTestingModule({ providers: [provideFirebaseAnalytics()] });
  });

  it('points ANALYTICS at the Firebase implementation', () => {
    expect(TestBed.inject(ANALYTICS)).toBeInstanceOf(FirebaseAnalytics);
  });

  describe('when Firebase is not configured', () => {
    // The path a fresh clone takes: no config, so no SDK is fetched at all.
    it('returns without importing the SDK', async () => {
      await TestBed.inject(ANALYTICS).initialize();

      expect(mockInitializeApp).not.toHaveBeenCalled();
      expect(mockGetAnalytics).not.toHaveBeenCalled();
    });

    it('drops events instead of throwing', () => {
      const analytics = TestBed.inject(ANALYTICS);

      expect(() => analytics.logEvent('some_event', { a: 1 })).not.toThrow();
      expect(() => analytics.logPageView('/profile', 'Profile')).not.toThrow();
      expect(mockLogEvent).not.toHaveBeenCalled();
    });
  });

  describe('when Firebase is configured', () => {
    beforeEach(() => {
      environment.firebaseEnabled = true;
    });

    it('initializes the app and forwards events', async () => {
      const analytics = TestBed.inject(ANALYTICS);
      await analytics.initialize();

      expect(mockInitializeApp).toHaveBeenCalledWith(
        environment.firebaseConfig,
      );

      analytics.logEvent('checkout', { total: 42 });
      expect(mockLogEvent).toHaveBeenCalledWith({ app: 'stub' }, 'checkout', {
        total: 42,
      });
    });

    it('logs a page view as a page_view event', async () => {
      const analytics = TestBed.inject(ANALYTICS);
      await analytics.initialize();

      analytics.logPageView('/settings', 'Settings');

      expect(mockLogEvent).toHaveBeenCalledWith(
        expect.anything(),
        'page_view',
        {
          page_path: '/settings',
          page_title: 'Settings',
        },
      );
    });

    // Calling initializeApp twice throws in the real SDK, so the guard matters when
    // something else in the app (auth, firestore) already booted it.
    it('reuses an already-initialized Firebase app', async () => {
      mockGetApps.mockReturnValue([{ name: '[DEFAULT]' }]);

      await TestBed.inject(ANALYTICS).initialize();

      expect(mockInitializeApp).not.toHaveBeenCalled();
      expect(mockGetAnalytics).toHaveBeenCalled();
    });

    // Analytics is unsupported in SSR, some in-app browsers and with cookies off.
    it('stays inert where analytics is unsupported', async () => {
      mockIsSupported.mockResolvedValue(false);

      const analytics = TestBed.inject(ANALYTICS);
      await analytics.initialize();
      analytics.logEvent('checkout');

      expect(mockGetAnalytics).not.toHaveBeenCalled();
      expect(mockLogEvent).not.toHaveBeenCalled();
    });
  });
});
