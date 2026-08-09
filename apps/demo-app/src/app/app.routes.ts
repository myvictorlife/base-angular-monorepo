import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () =>
      import('./pages/pages.routes').then((m) => m.appPagesRoutes),
  },
];
