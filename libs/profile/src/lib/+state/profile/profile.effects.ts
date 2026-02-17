import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { catchError, map, of, switchMap } from 'rxjs';
import { ProfileService } from '../../services/profile/profile.service';
import * as fromActions from './profile.actions';

@Injectable()
export class ProfileEffects {
    actions$ = inject(Actions);
    store = inject(Store);
    profileService = inject(ProfileService);

    fetchProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.fetchProfile),
            switchMap(() =>
                this.profileService.fetchProfile().pipe(
                    map((response) => {
                        return fromActions.fetchProfileSuccess({ response });
                    }),
                    catchError((error) => {
                        return of(fromActions.fetchProfileFailed({ error }));
                    })
                )
            )
        )
    );
}
