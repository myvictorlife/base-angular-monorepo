---
name: unit-testing
description: Write unit tests with Vitest and Spectator. Use when adding or fixing tests for a component, store, service or interceptor, and when a coverage threshold fails the build.
---

# Skill: Unit Testing with Vitest and Spectator

This project uses **Vitest** as the test runner — through Angular's official
`@angular/build:unit-test` builder — and **Spectator** as the Angular testing
utility. Spectator removes boilerplate from `TestBed` setup and provides a clean,
expressive API.

---

## Setup per project

There is no per-project runner config file. Each project's `test` target in
`project.json` uses the `@angular/build:unit-test` executor and carries only the
coverage options; everything shared (the `buildTarget` the specs compile against,
`watch: false`, caching, the `generate-config` dependency) lives in `nx.json`
under `targetDefaults`.

```sh
npx nx test <project-name>

# Examples
npx nx test profile
npx nx test demo-app
npx nx test ui

# Watch mode while developing
npx nx test profile --watch

# Run all, with coverage thresholds enforced
npx nx run-many -t test --all --coverage
```

`describe` / `it` / `expect` / `vi` are globals (typed via `vitest/globals` in each
`tsconfig.spec.json`) — do not import them. Import only types:

```typescript
import type { Mock, Mocked } from 'vitest';
```

### Runner specifics worth knowing

- **The builder compiles specs with the app's build pipeline.** The libraries here
  are non-buildable, so `buildTarget` points at `demo-app:build:development`
  (set once in `nx.json`).
- **`vi.mock` works for npm packages, not for `@libs/*` aliases.** Workspace
  aliases are resolved by the Angular build before Vitest sees an import to
  intercept. To vary a workspace module's behaviour, inject a stub through DI or
  mutate the real instance (see `firebase-analytics.spec.ts`).
- **Everything a `vi.mock` factory closes over must come from `vi.hoisted`** —
  factories are hoisted above the import graph.
- **`spectator.dispatchKeyboardEvent` does not work** — it goes through the legacy
  `initKeyboardEvent` API, which jsdom rejects under Vitest. Dispatch natively:
  `document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))`.
- **Specs run from the workspace root**, and `__dirname` points into the bundled
  output. A test that reads files from disk must resolve from `process.cwd()`.

---

## Coverage

Thresholds live in each project's `test` target (`coverageThresholds` in
`project.json`), set just under what that project measures today. Per-project
floors ratchet independently — raise a floor whenever its real number moves.

One honest caveat: coverage is measured from the compiled test bundle, so **a file
no spec imports is invisible to the report** — it does not drag the number down
the way the old whole-tree measurement did. An untested-but-routed page still
shows up (lazy chunks are part of the bundle); a component nothing references does
not. Treat a suspiciously high number in a thinly-tested project accordingly.

---

## Testing a Component with Spectator

Use `createComponentFactory` from `@ngneat/spectator/vitest` — always the
`/vitest` entry: it wires `createSpyObject`/`mockProvider` to `vi.fn` and types
the custom matchers against Vitest's `expect`.

### Basic component test

```typescript
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
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

## Testing a Component backed by a SignalStore

Provide the real store and stub the **service** it injects. Mocking the store itself
would test the mock; stubbing the service exercises the real state transitions and
still keeps the test off the network.

```typescript
import { createComponentFactory, Spectator } from '@ngneat/spectator/vitest';
import { Subject, of } from 'rxjs';
import { ProfileStore } from '../../+state/profile.store';
import { ProfileService } from '../../services/profile/profile.service';
import { ProfilePage } from './profile';

describe('ProfilePage', () => {
  let spectator: Spectator<ProfilePage>;

  const mockUser = { id: '1', name: 'John Doe' };
  // Shared so a test can decide what the service answers *before* the component is
  // created — the page fetches in its constructor.
  const profileService = { fetchProfile: vi.fn() };

  const createComponent = createComponentFactory({
    component: ProfilePage,
    providers: [
      ProfileStore,
      { provide: ProfileService, useValue: profileService },
    ],
  });

  /** Create the component only after the stub is configured. */
  const render = () => {
    spectator = createComponent();
    spectator.detectChanges();
    return spectator;
  };

  beforeEach(() => {
    profileService.fetchProfile.mockReset();
    profileService.fetchProfile.mockReturnValue(of(mockUser));
  });

  it('fetches on creation and displays the user name', () => {
    render();

    expect(profileService.fetchProfile).toHaveBeenCalledTimes(1);
    expect(spectator.query('[data-testid="user-name"]')).toHaveText('John Doe');
  });

  it('shows the loading state while the request is in flight', () => {
    profileService.fetchProfile.mockReturnValue(new Subject());

    render();

    expect(spectator.query('[role="status"]')).toExist();
  });
});
```

**Do not** create the component in a shared `beforeEach` when some tests need a
different service response — by then the constructor has already fetched.

---

## Testing a Service

Use `createServiceFactory` from Spectator.

```typescript
import {
  createServiceFactory,
  SpectatorService,
} from '@ngneat/spectator/vitest';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
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

  it('should return a user profile', () =>
    new Promise<void>((done) => {
      const mockUser = { id: '1', name: 'John' };

      spectator.service.fetchProfile().subscribe((user) => {
        expect(user).toEqual(mockUser);
        done();
      });

      const req = httpMock.expectOne('/api/profile');
      req.flush(mockUser);
    }));
});
```

---

## Testing a SignalStore

A store test is plain `TestBed` with the store and a stubbed service. No root store,
no effects runner, no marble diagrams — read the signals and assert on their values.
The reference is `libs/profile/src/lib/+state/profile.store.spec.ts`.

```typescript
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import { ProfileService } from '../services/profile/profile.service';
import { ProfileStore } from './profile.store';

const user = { id: '1', name: 'John' };
const error = { message: 'Not found', code: 'E_404', status: 404 };

describe('ProfileStore', () => {
  let profileService: { fetchProfile: Mock };

  const setup = () => {
    profileService = { fetchProfile: vi.fn().mockReturnValue(of(user)) };
    TestBed.configureTestingModule({
      providers: [
        ProfileStore,
        { provide: ProfileService, useValue: profileService },
      ],
    });
    return TestBed.inject(ProfileStore);
  };

  it('stores the profile on a successful fetch', () => {
    const store = setup();

    store.fetchProfile();

    expect(store.profile()).toEqual(user);
    expect(store.loading()).toBe(false);
  });

  it('flags loading while the request is in flight', () => {
    const store = setup();
    const response = new Subject<typeof user>();
    profileService.fetchProfile.mockReturnValue(response);

    store.fetchProfile();
    expect(store.loading()).toBe(true);

    response.next(user);
    expect(store.loading()).toBe(false);
  });

  it('stays usable after a failure so a retry can succeed', () => {
    const store = setup();
    profileService.fetchProfile.mockReturnValueOnce(throwError(() => error));

    store.fetchProfile();
    store.fetchProfile();

    expect(store.profile()).toEqual(user);
    expect(store.error()).toBeNull();
  });
});
```

**Cover at minimum:** initial state, success, failure, `loading` while in flight
(return a `Subject` instead of `of()`), and that a retry works after a failure — that
last one is what catches a missing `tapResponse`.

To write state directly — only for a scenario you cannot reach through a method —
import `unprotected` from `@ngrx/signals/testing`:

```typescript
import { unprotected } from '@ngrx/signals/testing';
patchState(unprotected(store), { loading: true });
```

---

## Common Spectator queries

```typescript
// Query by CSS selector
spectator.query('.class-name');
spectator.query('[data-testid="submit"]');
spectator.query('button');

// Query all matching elements
spectator.queryAll('li');

// Type into an input
spectator.typeInElement('some text', 'input');

// Click
spectator.click('button');
spectator.click(spectator.query('button[type="submit"]')!);

// Assertions (Spectator's DOM matchers, registered via expect.extend)
expect(el).toHaveText('Expected text');
expect(el).toBeVisible();
expect(el).toHaveClass('active');
expect(el).toHaveAttribute('disabled');
expect(el).not.toExist();
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

- [ ] Use `createComponentFactory` or `createServiceFactory` from `@ngneat/spectator/vitest` for components and services
- [ ] Use plain `TestBed` for SignalStore tests — the store is not a component
- [ ] Provide the real store and stub the **service** it injects, never mock the store
- [ ] Cover loading and error paths, not just the happy path
- [ ] Assert that a retry works after a failure — that is what catches a missing `tapResponse`
- [ ] Use `data-testid` for DOM queries in component tests
- [ ] Verify `httpMock.verify()` after each HTTP service test
- [ ] Never `vi.mock` a `@libs/*` alias — stub through DI instead
