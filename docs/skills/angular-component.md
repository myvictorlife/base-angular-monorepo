# Skill: Modern Angular Component Patterns

All components in this project follow Angular 20+ standards. These rules are non-negotiable.

---

## Component declaration

All components are **standalone**. Never use `NgModule` to declare components.

```typescript
@Component({
  selector: 'lib-user-info',
  imports: [],            // ← declare dependencies here, not in a module
  templateUrl: './user-info.html',
  styleUrls: ['./user-info.scss'],
})
export class UserInfoComponent {}
```

**File naming:** `<name>.ts` — no `.component.ts` suffix in this project.

---

## Inputs and Outputs

Use the `input()` and `output()` functions. Never use `@Input` or `@Output` decorators.

```typescript
import { Component, input, output } from '@angular/core';
import { User } from '@libs/entity';

@Component({ ... })
export class UserInfoComponent {
  // Required input
  user = input.required<User>();

  // Optional input with default
  editable = input<boolean>(false);

  // Output
  userSelected = output<User>();

  select() {
    this.userSelected.emit(this.user());
  }
}
```

**Consuming in a template:**

```html
<lib-user-info [user]="profileData" (userSelected)="onSelect($event)" />
```

---

## Template control flow

Use Angular's built-in control flow. Never use structural directives.

```html
<!-- CORRECT -->
@if (user()) {
  <div>Welcome, {{ user()!.name }}</div>
}

@for (item of items(); track item.id) {
  <li>{{ item.name }}</li>
} @empty {
  <li>No items found.</li>
}

@switch (status()) {
  @case ('active') { <span class="green">Active</span> }
  @case ('inactive') { <span class="red">Inactive</span> }
  @default { <span>Unknown</span> }
}
```

```html
<!-- WRONG — never use these -->
<div *ngIf="user">...</div>
<li *ngFor="let item of items">...</li>
<ng-container [ngSwitch]="status">...</ng-container>
```

---

## Dependency injection

Use `inject()` inside the class body. Never use constructor parameter injection.

```typescript
// CORRECT
export class ProfilePage {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
}

// WRONG
export class ProfilePage {
  constructor(private store: Store, private router: Router) {}
}
```

---

## Signals and reactive state

Use `selectSignal()` to bridge NgRx store and Angular signals. Use `computed()` to derive values.

```typescript
import { Component, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectProfile, selectLoading } from '../../+state/profile/profile.selectors';

export class ProfilePage {
  private readonly store = inject(Store);

  profile = this.store.selectSignal(selectProfile);
  loading = this.store.selectSignal(selectLoading);

  displayName = computed(() => this.profile()?.name ?? 'Anonymous');
}
```

---

## Lifecycle — use constructor, not ngOnInit

Angular Signals and modern patterns initialize reactively. Dispatch initial actions from the constructor.

```typescript
// CORRECT
export class ProfilePage {
  constructor() {
    this.store.dispatch(fetchProfile());
  }
}

// WRONG — do not use lifecycle hooks
export class ProfilePage implements OnInit {
  ngOnInit() {
    this.store.dispatch(fetchProfile());
  }
}
```

If you need a cleanup equivalent, use the `DestroyRef`:

```typescript
import { DestroyRef, inject } from '@angular/core';

export class ProfilePage {
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => {
      // cleanup
    });
  }
}
```

---

## Atomic Design — component classification

| Level | Description | Location |
|---|---|---|
| Atom | Single-purpose UI element (button, badge, avatar) | `atoms/` |
| Molecule | Combination of atoms with a specific function | `molecules/` |
| Organism | Full section composed of molecules (form, card list) | `organisms/` |
| Page | Route-level component, orchestrates organisms | `pages/` |

**Rules:**
- Atoms and Molecules are **presentational** — they receive data via `input()` and emit events via `output()`. They do not inject the Store.
- Pages are **container** components — they inject the Store, dispatch actions, and pass data down to molecules/atoms.

```typescript
// molecule — presentational only
export class UserInfoComponent {
  user = input<User>();           // data comes in
  editClicked = output<void>();   // events go out
  // NO store injection here
}

// page — container
export class ProfilePage {
  private readonly store = inject(Store);
  profile = this.store.selectSignal(selectProfile);
  // passes data down to UserInfoComponent
}
```

---

## Selector prefix

All component selectors in libs use the `lib-` prefix (configured in `project.json`).

```typescript
selector: 'lib-user-info'    // ← inside libs/
selector: 'app-home'         // ← inside apps/
```

---

## Checklist

- [ ] Component is standalone (`imports: []` declared in decorator)
- [ ] Uses `input()` / `output()` — no `@Input` / `@Output`
- [ ] Uses `@if` / `@for` — no `*ngIf` / `*ngFor`
- [ ] Uses `inject()` — no constructor parameter injection
- [ ] No `ngOnInit`, `ngOnDestroy`, `ngAfterViewInit`
- [ ] Molecules/Atoms do not inject `Store`
- [ ] Pages dispatch actions in the constructor
