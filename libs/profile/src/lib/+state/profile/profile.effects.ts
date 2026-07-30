import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ProfileService } from '../../services/profile/profile.service';
import * as fromActions from './profile.actions';

@Injectable()
export class ProfileEffects {
    private readonly actions$ = inject(Actions);
    private readonly profileService = inject(ProfileService);

    fetchProfile$ = createEffect(() =>
        this.actions$.pipe(
            ofType(fromActions.fetchProfile),
            switchMap(() =>
                this.profileService.fetchProfile().pipe(
                    map((response) => fromActions.fetchProfileSuccess({ response })),
                    catchError((error) => of(fromActions.fetchProfileFailed({ error })))
                )
            )
        )
    );
}
