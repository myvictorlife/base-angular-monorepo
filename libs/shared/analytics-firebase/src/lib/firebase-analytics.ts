import { Injectable } from '@angular/core';
import { Analytics as AnalyticsContract } from '@libs/analytics';
import { environment } from '@libs/environment';
import type { Analytics, logEvent as LogEventFn } from 'firebase/analytics';

/**
 * Firebase is imported dynamically, never statically.
 *
 * A static `import { getAnalytics } from 'firebase/analytics'` drags the SDK into
 * whatever chunk references it, and this service is resolved by the app
 * initializer — so every first paint paid ~25 kB for it even with
 * `firebaseEnabled: false`. Importing it here means the SDK is fetched only where
 * it is actually turned on.
 *
 * This class is the *only* place in the workspace that names Firebase. Deleting
 * this library and dropping the `firebase` dependency leaves the rest of the code
 * compiling against `ANALYTICS`, which then resolves to `NoopAnalytics`.
 */
@Injectable()
export class FirebaseAnalytics implements AnalyticsContract {
  private analytics: Analytics | null = null;
  /** Captured at init so `logEvent` can stay synchronous for callers. */
  private logEventFn: typeof LogEventFn | null = null;

  async initialize(): Promise<void> {
    if (!environment.firebaseEnabled) return;

    const [analyticsSdk, appSdk] = await Promise.all([
      import('firebase/analytics'),
      import('firebase/app'),
    ]);

    const supported = await analyticsSdk.isSupported();
    if (!supported) return;

    if (!appSdk.getApps().length) {
      appSdk.initializeApp(environment.firebaseConfig);
    }

    this.analytics = analyticsSdk.getAnalytics();
    this.logEventFn = analyticsSdk.logEvent;
  }

  logEvent(eventName: string, params?: Record<string, unknown>): void {
    if (!this.analytics || !this.logEventFn) return;
    this.logEventFn(this.analytics, eventName, params);
  }

  logPageView(pagePath: string, pageTitle?: string): void {
    this.logEvent('page_view', { page_path: pagePath, page_title: pageTitle });
  }
}
