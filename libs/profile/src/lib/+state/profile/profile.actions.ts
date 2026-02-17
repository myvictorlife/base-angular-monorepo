
import { User, IGenericError } from "@libs/entity";
import { createAction, props } from "@ngrx/store";

export const fetchProfile = createAction(
    '[PROFILE] Fetch Profile'
);

export const fetchProfileSuccess = createAction(
    '[PROFILE] Fetch Profile Success',
    props<{ response: User }>()
);

export const fetchProfileFailed = createAction(
    '[PROFILE] Fetch Profile Failed',
    props<{ error: IGenericError }>()
);