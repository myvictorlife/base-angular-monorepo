import { Routes } from '@angular/router';
import { ProfileStore } from '../+state/profile.store';
import { ProfileService } from '../services/profile/profile.service';
import { Profile } from './profile/profile';

export const profileRoutes: Routes = [
  {
    path: '',
    // Feature state lives on the route: the store is created when the feature is
    // entered, instead of being smuggled in through a component's imports array.
    providers: [ProfileStore, ProfileService],
    component: Profile
  }
];
