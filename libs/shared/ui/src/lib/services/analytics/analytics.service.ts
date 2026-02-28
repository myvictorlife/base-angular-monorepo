import { Injectable } from '@angular/core';
import { Analytics, getAnalytics, isSupported, logEvent } from 'firebase/analytics';
import { getApps, initializeApp } from 'firebase/app';
import { environment } from '@libs/environment';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private analytics: Analytics | null = null;

  async initialize(): Promise<void> {
    if (!environment.firebaseEnabled) return;

    const supported = await isSupported();
    if (!supported) return;

    if (!getApps().length) {
      initializeApp(environment.firebaseConfig);
    }

    this.analytics = getAnalytics();
  }

  logEvent(eventName: string, params?: Record<string, unknown>): void {
    if (!this.analytics) return;
    logEvent(this.analytics, eventName, params);
  }

  logPageView(pagePath: string, pageTitle?: string): void {
    this.logEvent('page_view', { page_path: pagePath, page_title: pageTitle });
  }
}
