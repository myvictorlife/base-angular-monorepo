import { Routes } from '@angular/router';
import { SettingsStore } from '../+state/settings.store';
import { Settings } from './settings/settings';

export const settingsRoutes: Routes = [
  {
    path: '',
    // Same contract as `profileRoutes`: feature state is created on entry and torn
    // down on exit, so nothing about this feature exists while you are elsewhere.
    providers: [SettingsStore],
    component: Settings,
  },
];
