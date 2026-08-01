import { provideRouter } from '@angular/router';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { App } from './app';

class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({ HEADER: { HOME: 'Home', START: 'Get started' } });
  }
}

describe('App', () => {
  let spectator: Spectator<App>;
  const createComponent = createComponentFactory({
    component: App,
    providers: [
      // The root component renders the header, so its dependencies have to be
      // satisfied here — that is the cost of the header being app chrome rather
      // than something each page repeats.
      provideRouter([]),
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: 'en',
        fallbackLang: 'en',
      }),
    ],
  });

  beforeEach(() => {
    // ThemeService (via the header's theme toggle) reads matchMedia, absent in jsdom.
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: () => ({ matches: false, addEventListener: () => undefined }),
    });
    spectator = createComponent();
  });

  it('should render router outlet', () => {
    expect(spectator.query('router-outlet')).toBeTruthy();
  });

  it('renders the header on every route', () => {
    expect(spectator.query('lib-header')).toBeTruthy();
    expect(spectator.query('header')).toBeTruthy();
  });
});
