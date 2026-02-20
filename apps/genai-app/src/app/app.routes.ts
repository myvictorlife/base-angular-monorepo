import { Route } from '@angular/router';

export const appRoutes: Route[] = [{
    path: '',
    pathMatch: 'full',
    redirectTo: 'chat'
}, {
    path: '',
    loadChildren: () =>
        import('./pages/pages.routes').then((m) => m.genaiPagesRoutes),
}, {
    path: 'translate',
    loadChildren: () =>
        import('@libs/translation').then((m) => m.updateLanguageRoutes),
}];
