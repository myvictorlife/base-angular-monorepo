import { Route } from '@angular/router';
import { updateLanguageRoutes } from '@libs/translation';

export const appRoutes: Route[] = [{
    path: '',
    loadChildren: () =>
        import('./pages/pages.routes').then((m) => m.genaiPagesRoutes),
}, {
    // @libs/translation is imported statically by the header, which renders on every
    // page, so it is always in the initial bundle. Lazy-loading it here only looked
    // like a split; keeping the import static makes the real cost visible.
    path: 'translate',
    children: updateLanguageRoutes,
}];
