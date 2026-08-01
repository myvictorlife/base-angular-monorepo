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

import { provideRouterStore } from '@ngrx/router-store';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import {
  provideHttpClient,
  withInterceptors,
  withXhr,
} from '@angular/common/http';
import { ANALYTICS } from '@libs/analytics';
import { provideFirebaseAnalytics } from '@libs/analytics-firebase';
import { GlobalErrorHandler, httpErrorInterceptor } from '@libs/ui';
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

    provideHttpClient(withXhr(), withInterceptors([httpErrorInterceptor])),

    // Uncaught errors reach analytics instead of only the console.
    { provide: ErrorHandler, useClass: GlobalErrorHandler },

    // The one line that couples this app to Firebase. Delete it (and the
    // `@libs/analytics-firebase` lib) and `ANALYTICS` falls back to `NoopAnalytics`
    // — nothing else in the workspace changes.
    provideFirebaseAnalytics(),

    // The global store exists for router state only. Feature state lives in a
    // SignalStore inside its own lib and is provided on the route that needs it.
    provideStore(reducers, { metaReducers }),
    // The serializer belongs here. Registering StoreRouterConnectingModule.forRoot()
    // as well would re-provide RouterStateSerializer and silently win, dropping
    // CustomSerializer for the default MinimalRouterStateSerializer.
    provideRouterStore({ serializer: CustomSerializer }),

    // Must come after provideHttpClient(): the i18n loader fetches assets/i18n.
    provideTranslation(),

    // Devtools ship real code and keep every action in memory. Keep them out of
    // production builds entirely rather than merely switching them to logOnly.
    ...(environment.production ? [] : [provideStoreDevtools({ maxAge: 25 })]),

    // Initialize analytics and track route changes. Whatever `ANALYTICS` resolves
    // to — Firebase above, or the no-op default — this block is unchanged.
    provideAppInitializer(() => {
      const analytics = inject(ANALYTICS);
      const router = inject(Router);
      const title = inject(Title);

      // Deliberately not awaited: the initializer gates first paint, and the
      // implementation may dynamically import a vendor SDK. Awaiting it would put a
      // network fetch in front of the user's first render for a purely observational
      // concern. Events fired before init resolves are dropped by design.
      void analytics.initialize();

      router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((e) => {
          // Read the title after TitleStrategy has run, so page_title carries the
          // translated string the user actually sees instead of undefined.
          analytics.logPageView(
            (e as NavigationEnd).urlAfterRedirects,
            title.getTitle(),
          );
        });
    }),
  ],
};
