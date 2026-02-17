import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { App } from './app';

describe('App', () => {
  let spectator: Spectator<App>;
  const createComponent = createComponentFactory({
    component: App,
  });

  it('should render router outlet', () => {
    spectator = createComponent();
    expect(spectator.query('router-outlet')).toBeTruthy();
  });
});
