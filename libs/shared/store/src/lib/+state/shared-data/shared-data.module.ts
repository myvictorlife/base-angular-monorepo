// players-state.module.ts

import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import * as fromReducer from './shared-data.reducer';

@NgModule({
  imports: [
    EffectsModule.forFeature([]),
    StoreModule.forFeature(
      fromReducer.sharedDataStateFeatureKey,
      fromReducer.reducer
    ),
  ],
  providers: [],
})
export class SharedDataStateModule {}
