import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  NavigationEnd,
  PreloadAllModules,
  Router,
  provideRouter,
  withComponentInputBinding,
  withPreloading,
} from '@angular/router';
import { Title } from '@angular/platform-browser';
import { appRoutes } from './app.routes';

import { environment } from '@libs/environment';

import { provideEffects } from '@ngrx/effects';
import { provideRouterStore } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AnalyticsService, GlobalErrorHandler, httpErrorInterceptor } from '@libs/ui';
import { provideSharedDataState } from '@libs/store';
import { provideTranslation } from '@libs/translation';
import { metaReducers, reducers } from './core/+state';
import { CustomSerializer } from './core/services/router/router-serializer';
import { filter } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // The app is signals + OnPush throughout, so zone.js has nothing to observe.
    provideZonelessChangeDetection(),
    provideRouter(
      appRoutes,
      withComponentInputBinding(),
      // Lazy chunks are small; fetch them in the background so navigation is instant.
      withPreloading(PreloadAllModules),
    ),

    provideHttpClient(withInterceptors([httpErrorInterceptor])),

    // Uncaught errors reach analytics instead of only the console.
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

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
      const title = inject(Title);

      await analytics.initialize();

      router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((e) => {
          // Read the title after TitleStrategy has run, so page_title carries the
          // translated string the user actually sees instead of undefined.
          analytics.logPageView((e as NavigationEnd).urlAfterRedirects, title.getTitle());
        });
    }),
  ],
};
