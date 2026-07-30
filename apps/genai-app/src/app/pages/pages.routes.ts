import { Routes } from '@angular/router';
import { HomePage } from './home/home';
import { NotFoundPage } from './not-found/not-found';

export const genaiPagesRoutes: Routes = [
  {
    path: '',
    component: HomePage
  }, {
    path: 'profile',
    loadChildren: () => import('@libs/profile').then(m => m.profileRoutes)
  }, {
    path: '**',
    component: NotFoundPage
  }
];