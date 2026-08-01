import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ANALYTICS } from '@libs/analytics';

/**
 * Reports uncaught errors to analytics instead of letting them vanish into the
 * console, then rethrows to the default handler so local debugging is unchanged.
 *
 * Depends on the `ANALYTICS` contract, not on any vendor SDK — with no analytics
 * provider registered this quietly reports into `NoopAnalytics`.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly analytics = inject(ANALYTICS);
  private readonly fallback = new ErrorHandler();

  handleError(error: unknown): void {
    const err = error as {
      message?: string;
      name?: string;
      stack?: string;
    } | null;

    this.analytics.logEvent('app_exception', {
      // Analytics backends truncate long params; keep the useful head of each field.
      name: err?.name ?? 'Error',
      message: (err?.message ?? String(error)).slice(0, 300),
      stack: err?.stack?.slice(0, 500),
    });

    this.fallback.handleError(error);
  }
}
