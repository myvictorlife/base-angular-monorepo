import { RouterStateSnapshot } from '@angular/router';
import { RouterStateSerializer } from '@ngrx/router-store';
import { RouterStateUrl } from '@libs/entity';

export class CustomSerializer implements RouterStateSerializer<RouterStateUrl> {
  serialize(routerState: RouterStateSnapshot): RouterStateUrl {
    let route = routerState.root;

    while (route.firstChild) {
      route = route.firstChild;
    }

    const {
      url,
      root: { queryParams },
    } = routerState;
    const { params } = route;

    // The snapshot itself cannot go into the store: it holds component instances
    // and a circular route tree, which breaks serializability and the devtools.
    return { url, params, queryParams };
  }
}
