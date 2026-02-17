import { Routes } from '@angular/router';
import { HomePage } from './home/home';

export const genaiPagesRoutes: Routes = [
  {
    path: '',
    component: HomePage
  }, {
    path: 'profile',
    loadChildren: () => import('@libs/profile').then(m => m.profileRoutes)
  }
];