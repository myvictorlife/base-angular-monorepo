import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { provideMockStore } from '@ngrx/store/testing';

import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RouterModule } from '@angular/router';
import { TranslationLibModule } from '../../translation-lib.module';
import { UpdateLanguageComponent } from './update-language.component';

describe('UpdateLanguageComponent', () => {
  let spectator: Spectator<UpdateLanguageComponent>;

  const initialState = {};

  const createComponent = createComponentFactory({
    component: UpdateLanguageComponent,
    imports: [
      FormsModule,
      ReactiveFormsModule,
      IonicModule.forRoot(),
      RouterModule.forRoot([]),
      TranslationLibModule,
    ],
    providers: [
      provideMockStore(initialState),
      provideHttpClient(),
      provideHttpClientTesting(),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should create', () => {
    expect(spectator).toBeTruthy();
  });
});
