import { ErrorHandler, Injectable, inject } from '@angular/core';
import { AnalyticsService } from '../services/analytics/analytics.service';

/**
 * Reports uncaught errors to analytics instead of letting them vanish into the
 * console, then rethrows to the default handler so local debugging is unchanged.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly analytics = inject(AnalyticsService);
  private readonly fallback = new ErrorHandler();

  handleError(error: unknown): void {
    const err = error as { message?: string; name?: string; stack?: string } | null;

    this.analytics.logEvent('app_exception', {
      // Firebase truncates long params; keep the useful head of each field.
      name: err?.name ?? 'Error',
      message: (err?.message ?? String(error)).slice(0, 300),
      stack: err?.stack?.slice(0, 500),
    });

    this.fallback.handleError(error);
  }
}
