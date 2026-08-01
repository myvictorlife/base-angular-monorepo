import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ANALYTICS } from '@libs/analytics';
import { FirebaseAnalytics } from './firebase-analytics';

/**
 * Opt-in. Call it in `app.config.ts` to point `ANALYTICS` at Firebase:
 *
 * ```ts
 * providers: [provideFirebaseAnalytics()]
 * ```
 *
 * Leave it out and `ANALYTICS` stays on `NoopAnalytics` — no SDK, no config, no
 * call-site changes. With it in, a missing `.env` still degrades to inert:
 * `firebaseEnabled` is `false` and `initialize()` returns before importing
 * anything.
 */
export function provideFirebaseAnalytics(): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: ANALYTICS, useClass: FirebaseAnalytics },
  ]);
}
