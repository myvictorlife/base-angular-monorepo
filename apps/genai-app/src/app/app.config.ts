import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { NavigationEnd, Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';

import { environment } from '@libs/environment';

import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { provideHttpClient } from '@angular/common/http';
import { AnalyticsService } from '@libs/ui';
import { provideSharedDataState } from '@libs/store';
import { provideTranslation } from '@libs/translation';
import { metaReducers, reducers } from './core/+state';
import { CustomSerializer } from './core/services/router/router-serializer';
import { filter } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),

    provideHttpClient(),

    provideStore(reducers, { metaReducers }),
    provideEffects(),
    // The serializer belongs here. Registering StoreRouterConnectingModule.forRoot()
    // as well would re-provide RouterStateSerializer and silently win, dropping
    // CustomSerializer for the default MinimalRouterStateSerializer.
    provideRouterStore({ serializer: CustomSerializer }),
    provideSharedDataState(),

    // Must come after provideHttpClient(): the i18n loader fetches assets/i18n.
    provideTranslation(),

    // Devtools ship real code and keep every action in memory. Keep them out of
    // production builds entirely rather than merely switching them to logOnly.
    ...(environment.production
      ? []
      : [provideStoreDevtools({ maxAge: 25 })]),

    // Initialize Firebase Analytics and track route changes
    provideAppInitializer(async () => {
      const analytics = inject(AnalyticsService);
      const router = inject(Router);

      await analytics.initialize();

      router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((e) => {
          analytics.logPageView((e as NavigationEnd).urlAfterRedirects);
        });
    }),
  ],
};
