import { Routes } from '@angular/router';
import { provideProfileState } from '../+state/profile/profile.providers';
import { Profile } from './profile/profile';

export const profileRoutes: Routes = [
  {
    path: '',
    // Feature state lives on the route: created when the feature is entered,
    // instead of being smuggled in through a component's imports array.
    providers: [provideProfileState()],
    component: Profile
  }
];
