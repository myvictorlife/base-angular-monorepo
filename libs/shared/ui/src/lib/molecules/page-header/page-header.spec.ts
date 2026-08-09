import { Component, signal } from '@angular/core';
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import {
  TranslateLoader,
  TranslationObject,
  provideTranslateService,
} from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { PageHeaderComponent } from './page-header';

class StubTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<TranslationObject> {
    return of({
      PAGE: { TITLE: 'Settings', LEAD: 'Stored on this device.' },
    });
  }
}

@Component({
  imports: [PageHeaderComponent],
  template: `<lib-page-header titleKey="PAGE.TITLE" [leadKey]="leadKey()" />`,
})
class HostComponent {
  readonly leadKey = signal<string | null>(null);
}

describe('PageHeaderComponent', () => {
  let spectator: Spectator<HostComponent>;

  const createComponent = createComponentFactory({
    component: HostComponent,
    providers: [
      provideTranslateService({
        loader: [{ provide: TranslateLoader, useClass: StubTranslateLoader }],
        lang: 'en',
        fallbackLang: 'en',
      }),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    spectator.detectChanges();
  });

  it('renders the translated title as the page h1', () => {
    expect(spectator.query('h1')).toHaveText('Settings');
  });

  it('renders no lead paragraph unless one is given', () => {
    expect(spectator.query('.page-header__lead')).not.toExist();
  });

  it('renders the translated lead when given', () => {
    spectator.component.leadKey.set('PAGE.LEAD');
    spectator.detectChanges();

    expect(spectator.query('.page-header__lead')).toHaveText(
      'Stored on this device.',
    );
  });
});
