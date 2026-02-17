import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { Profile } from './profile';
import { provideMockStore } from '@ngrx/store/testing';
import { Router } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';

describe('Profile', () => {
  let spectator: Spectator<Profile>;
  let router: Router;
  const createComponent = createComponentFactory({
    component: Profile,
    imports: [
        StoreModule.forRoot({}),
        EffectsModule.forRoot([])
    ],
    providers: [
      {
        provide: Router,
        useValue: { navigate: jest.fn() },
      },
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    router = spectator.inject(Router);
  });

  it('should create', () => {
    expect(spectator.component).toBeTruthy();
  });

  it('should render Back to Home button', () => {
    const button = spectator.query('button');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('Back to Home');
  });

  it('should call goHome when Back to Home button is clicked', () => {
    const spy = jest.spyOn(spectator.component, 'goHome');
    spectator.click('button');
    expect(spy).toHaveBeenCalled();
  });

  it('should navigate to home when goHome is called', () => {
    spectator.component.goHome();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
