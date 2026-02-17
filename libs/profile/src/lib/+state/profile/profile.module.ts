import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ProfileService } from '../../services/profile/profile.service';
import * as fromReducer from './profile.reducer';
import { ProfileEffects } from './profile.effects';

@NgModule({
    imports: [
        StoreModule.forFeature(
            fromReducer.profileFeatureKey,
            fromReducer.reducer
        ),
        EffectsModule.forFeature([ProfileEffects]),
    ],
    providers: [ProfileService],
})
export class ProfileStateModule { }
