
import { User } from '@libs/entity';
import { createAction, props } from '@ngrx/store';

export const setProfile = createAction(
  '[Shared Data] Set Profile',
  props<{ profile: User }>()
);
