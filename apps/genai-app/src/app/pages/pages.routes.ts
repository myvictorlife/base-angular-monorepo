import { Routes } from '@angular/router';
import { HomePage } from './home/home';
import { NotFoundPage } from './not-found/not-found';

export const genaiPagesRoutes: Routes = [
  {
    path: '',
    title: 'HOME.TITLE',
    component: HomePage
  }, {
    path: 'profile',
    title: 'PROFILE.TITLE',
    loadChildren: () => import('@libs/profile').then(m => m.profileRoutes)
  }, {
    path: '**',
    title: 'NOT_FOUND.TITLE',
    component: NotFoundPage
  }
];