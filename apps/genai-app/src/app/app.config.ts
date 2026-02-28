import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { NavigationEnd, Router, provideRouter, withComponentInputBinding } from '@angular/router';
import { appRoutes } from './app.routes';

import { environment } from '@libs/environment';

import { EffectsModule } from '@ngrx/effects';
import { provideRouterStore, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { provideHttpClient } from '@angular/common/http';
import { AnalyticsService } from '@libs/ui';
import { SharedDataStateModule } from '@libs/store';
import { metaReducers, reducers } from './core/+state';
import { CustomSerializer } from './core/services/router/router-serializer';
import { filter } from 'rxjs';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom([
      StoreModule.forRoot(reducers, { metaReducers }),
      EffectsModule.forRoot([]),
      StoreRouterConnectingModule.forRoot({
        serializer: CustomSerializer,
      }),
      SharedDataStateModule,
    ]),

    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes, withComponentInputBinding()),

    provideHttpClient(),
    provideRouterStore(),

    provideStoreDevtools({
      maxAge: 25,
      logOnly: environment.production,
    }),

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
