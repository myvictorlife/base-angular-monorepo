import { Routes } from '@angular/router';
import { HomePage } from './home/home';
import { DesignPage } from './design/design';
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
    path: 'design',
    title: 'DESIGN.TITLE',
    component: DesignPage
  }, {
    path: '**',
    title: 'NOT_FOUND.TITLE',
    component: NotFoundPage
  }
];