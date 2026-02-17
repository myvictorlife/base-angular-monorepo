# Skill: Unit Testing with Jest and Spectator

This project uses **Jest** as the test runner and **Spectator** as the Angular testing utility.
Spectator removes boilerplate from `TestBed` setup and provides a clean, expressive API.

---

## Setup per project

Each library has its own `jest.config.ts` and `test-setup.ts`. Run tests for a specific project:

```sh
npx nx test <project-name>

# Examples
npx nx test profile
npx nx test genai-app
npx nx test shared-ui

# Run all
npx nx run-many --target=test --all
```

---

## Testing a Component with Spectator

Use `createComponentFactory` from `@ngrx/spectator` (or `@ngrx/spectator/jest`).

### Basic component test

```typescript
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { UserInfoComponent } from './user-info';
import { User } from '@libs/entity';

describe('UserInfoComponent', () => {
  let spectator: Spectator<UserInfoComponent>;

  const createComponent = createComponentFactory({
    component: UserInfoComponent,
  });

  beforeEach(() => {
    spectator = createComponent();
  });

  it('should display the user name', () => {
    const user: User = { id: '1', name: 'Jane Doe' };

    spectator.setInput('user', user);

    expect(spectator.query('h2')).toHaveText('Jane Doe');
  });

  it('should display the first letter of the name as avatar', () => {
    spectator.setInput('user', { id: '1', name: 'Jane Doe' });

    expect(spectator.query('.avatar')).toHaveText('J');
  });
});
```

### Component with outputs

```typescript
it('should emit userSelected when button is clicked', () => {
  const user: User = { id: '1', name: 'Jane' };
  spectator.setInput('user', user);

  const emitted = spectator.output<User>('userSelected');

  spectator.click('button');

  expect(emitted).toHaveBeenCalledWith(user);
});
```

### Component with signal inputs

Signal inputs (`input()`) are set the same way via `setInput`:

```typescript
spectator.setInput('user', { id: '1', name: 'Jane' });
```

---

## Testing a Component with NgRx Store

Use `provideMockStore` from `@ngrx/store/testing`.

```typescript
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ProfilePage } from './profile';
import { selectProfile } from '../../+state/profile/profile.selectors';
import { fetchProfile } from '../../+state/profile/profile.actions';
import { ProfileStateModule } from '../../+state/profile/profile.module';

describe('ProfilePage', () => {
  let spectator: Spectator<ProfilePage>;
  let store: MockStore;

  const mockUser = { id: '1', name: 'John Doe' };

  const createComponent = createComponentFactory({
    component: ProfilePage,
    imports: [ProfileStateModule],
    providers: [
      provideMockStore({
        selectors: [
          { selector: selectProfile, value: mockUser },
        ],
      }),
    ],
  });

  beforeEach(() => {
    spectator = createComponent();
    store = spectator.inject(MockStore);
  });

  it('should dispatch fetchProfile on init', () => {
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    spectator.component.loadProfile();

    expect(dispatchSpy).toHaveBeenCalledWith(fetchProfile());
  });

  it('should display the user name from the store', () => {
    expect(spectator.query('[data-testid="user-name"]')).toHaveText('John Doe');
  });

  it('should update view when store emits new value', () => {
    store.overrideSelector(selectProfile, { id: '2', name: 'Jane' });
    store.refreshState();
    spectator.detectChanges();

    expect(spectator.query('[data-testid="user-name"]')).toHaveText('Jane');
  });
});
```

---

## Testing a Service

Use `createServiceFactory` from Spectator.

```typescript
import { createServiceFactory, SpectatorService } from '@ngneat/spectator/jest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let spectator: SpectatorService<ProfileService>;
  let httpMock: HttpTestingController;

  const createService = createServiceFactory({
    service: ProfileService,
    imports: [HttpClientTestingModule],
  });

  beforeEach(() => {
    spectator = createService();
    httpMock = spectator.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return a user profile', (done) => {
    const mockUser = { id: '1', name: 'John' };

    spectator.service.fetchProfile().subscribe((user) => {
      expect(user).toEqual(mockUser);
      done();
    });

    const req = httpMock.expectOne('/api/profile');
    req.flush(mockUser);
  });
});
```

---

## Testing NgRx Effects

Use `provideMockActions` and `provideMockStore`.

```typescript
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable, of, throwError } from 'rxjs';
import { Action } from '@ngrx/store';
import { ProfileEffects } from './profile.effects';
import { ProfileService } from '../../services/profile/profile.service';
import * as fromActions from './profile.actions';

describe('ProfileEffects', () => {
  let effects: ProfileEffects;
  let actions$: Observable<Action>;
  let profileService: jest.Mocked<ProfileService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProfileEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        {
          provide: ProfileService,
          useValue: { fetchProfile: jest.fn() },
        },
      ],
    });

    effects = TestBed.inject(ProfileEffects);
    profileService = TestBed.inject(ProfileService) as jest.Mocked<ProfileService>;
  });

  it('should dispatch fetchProfileSuccess on success', (done) => {
    const mockUser = { id: '1', name: 'John' };
    profileService.fetchProfile.mockReturnValue(of(mockUser));

    actions$ = of(fromActions.fetchProfile());

    effects.fetchProfile$.subscribe((action) => {
      expect(action).toEqual(fromActions.fetchProfileSuccess({ response: mockUser }));
      done();
    });
  });

  it('should dispatch fetchProfileFailed on error', (done) => {
    const mockError = { message: 'Not found' };
    profileService.fetchProfile.mockReturnValue(throwError(() => mockError));

    actions$ = of(fromActions.fetchProfile());

    effects.fetchProfile$.subscribe((action) => {
      expect(action).toEqual(fromActions.fetchProfileFailed({ error: mockError }));
      done();
    });
  });
});
```

---

## Testing NgRx Reducer

Reducers are pure functions — test them directly without any Angular setup.

```typescript
import { reducer, initialState } from './profile.reducer';
import * as fromActions from './profile.actions';

describe('Profile Reducer', () => {
  it('should set loading to true when fetchProfile is dispatched', () => {
    const state = reducer(initialState, fromActions.fetchProfile());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should add the user on fetchProfileSuccess', () => {
    const user = { id: '1', name: 'John' };
    const state = reducer(initialState, fromActions.fetchProfileSuccess({ response: user }));
    expect(state.loading).toBe(false);
    expect(state.ids).toContain('1');
  });

  it('should set error on fetchProfileFailed', () => {
    const error = { message: 'Error' };
    const state = reducer(initialState, fromActions.fetchProfileFailed({ error }));
    expect(state.loading).toBe(false);
    expect(state.error).toEqual(error);
  });
});
```

---

## Common Spectator queries

```typescript
// Query by CSS selector
spectator.query('.class-name')
spectator.query('[data-testid="submit"]')
spectator.query('button')

// Query all matching elements
spectator.queryAll('li')

// Type into an input
spectator.typeInElement('some text', 'input')

// Click
spectator.click('button')
spectator.click(spectator.query('button[type="submit"]')!)

// Assertions (jest-dom matchers)
expect(el).toHaveText('Expected text')
expect(el).toBeVisible()
expect(el).toHaveClass('active')
expect(el).toHaveAttribute('disabled')
expect(el).not.toExist()
```

---

## data-testid convention

Use `data-testid` attributes in templates for stable query targets. Never rely on CSS classes for test queries, as they can change with styling updates.

```html
<!-- template -->
<h2 data-testid="user-name">{{ user()?.name }}</h2>
<button data-testid="back-button" (click)="goHome()">Back</button>
```

```typescript
// test
expect(spectator.query('[data-testid="user-name"]')).toHaveText('John Doe');
spectator.click('[data-testid="back-button"]');
```

---

## Checklist

- [ ] Use `createComponentFactory` or `createServiceFactory` from Spectator — avoid raw `TestBed`
- [ ] Use `provideMockStore` for components that depend on NgRx
- [ ] Use `provideMockActions` for effect tests
- [ ] Test reducers as pure functions — no TestBed needed
- [ ] Use `data-testid` for DOM queries in component tests
- [ ] Call `store.refreshState()` + `spectator.detectChanges()` after overriding selectors
- [ ] Verify `httpMock.verify()` after each HTTP service test
