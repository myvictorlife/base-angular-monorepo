import { InjectionToken } from '@angular/core';

/**
 * The only analytics surface the rest of the workspace is allowed to know about.
 *
 * Deliberately vendor-neutral: no Firebase type appears here, so swapping in
 * Plausible, PostHog or nothing at all is a change to one provider function
 * rather than to every caller.
 */
export interface Analytics {
  /** Called once during app initialization. Must resolve even when disabled. */
  initialize(): Promise<void>;
  logEvent(eventName: string, params?: Record<string, unknown>): void;
  logPageView(pagePath: string, pageTitle?: string): void;
}

/**
 * Does nothing, on purpose.
 *
 * This is the default the token falls back to, which is what makes analytics
 * genuinely optional: an app that never calls `provideFirebaseAnalytics()` still
 * injects `ANALYTICS` everywhere without a single `if (analytics)` guard at the
 * call sites, and pulls in no vendor SDK.
 */
export class NoopAnalytics implements Analytics {
  async initialize(): Promise<void> {
    // Intentionally empty.
  }

  logEvent(): void {
    // Intentionally empty.
  }

  logPageView(): void {
    // Intentionally empty.
  }
}

/**
 * Injected by consumers; provided by an implementation library.
 *
 * The factory default means "no analytics" is the zero-config behaviour rather
 * than a NullInjectorError — a template has to run before you own a Firebase
 * project.
 */
export const ANALYTICS = new InjectionToken<Analytics>('ANALYTICS', {
  providedIn: 'root',
  factory: () => new NoopAnalytics(),
});
