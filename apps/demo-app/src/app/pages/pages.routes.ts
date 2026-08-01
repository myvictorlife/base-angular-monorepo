import { Routes } from '@angular/router';
import { HomePage } from './home/home';
import { DesignPage } from './design/design';
import { NotFoundPage } from './not-found/not-found';

export const appPagesRoutes: Routes = [
  {
    path: '',
    title: 'HOME.TITLE',
    component: HomePage,
  },
  {
    path: 'profile',
    title: 'PROFILE.TITLE',
    loadChildren: () => import('@libs/profile').then((m) => m.profileRoutes),
  },
  {
    path: 'settings',
    title: 'SETTINGS.TITLE',
    loadChildren: () => import('@libs/settings').then((m) => m.settingsRoutes),
  },
  {
    path: 'design',
    title: 'DESIGN.TITLE',
    component: DesignPage,
  },
  {
    path: '**',
    title: 'NOT_FOUND.TITLE',
    component: NotFoundPage,
  },
];
