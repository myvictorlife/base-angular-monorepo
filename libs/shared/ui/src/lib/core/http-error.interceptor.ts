import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AnalyticsService } from '../services/analytics/analytics.service';

/**
 * Central reporting point for failed HTTP calls.
 *
 * It deliberately re-throws: callers keep full control of user-facing handling
 * (the profile effect, for instance, maps the failure into its own state). This
 * only guarantees no request fails unobserved.
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const analytics = inject(AnalyticsService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      analytics.logEvent('http_error', {
        url: req.urlWithParams,
        method: req.method,
        // 0 means the request never reached the server (offline, CORS, blocked).
        status: error.status,
        message: error.message?.slice(0, 300),
      });

      return throwError(() => error);
    })
  );
};
