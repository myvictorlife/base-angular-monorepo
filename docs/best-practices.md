# Best Practices Guide

## Project Context

- This project is a **mobile-first** application built with **Angular 21** and organized as an **Nx monorepo**.
- Focus on modern, responsive design and excellent user experience.
- Code must be clean, modular, scalable, and follow best practices for modern Angular architecture.

---

## Architecture Pattern

### Atomic Design

- The project follows **Atomic Design** for component organization:
  - **Atoms**: Basic, reusable elements (e.g., buttons, inputs).
  - **Molecules**: Combinations of atoms for more complex components.
  - **Organisms**: Complete structures composed of molecules and atoms.
  - **Templates/Pages**: Layout structures and pages.
- **Example:** The restaurant module follows this pattern. Use it as a reference for new components and folder organization.


---

## Shared Module: shared

- The `shared` module contains global resources and utilities:
  - **environments**: Manages all system environment variables. Use this for configuration and endpoints.
  - **shared/ui**: Shared UI components, following Atomic Design.
- Always prefer reusing resources from `shared` to avoid duplication and ensure consistency.

---

## Code Guidelines

### 1. **Angular 21**
- **DO NOT** use outdated or "anti-pattern" features such as:
  - `*ngIf`, `*ngFor`, `@Input`, `@Output`, `ngOnInit`, `ngOnDestroy`, `ngAfterViewInit`, etc.
  - Avoid any decorator-based direct component communication.
- **Always use Angular's built-in control flow:**
  - Use `@if` instead of `*ngIf` and `@for` instead of `*ngFor`.
  - Example:
    ```html
    @if (user()) {
      <div>Welcome, {{ user().name }}</div>
    }
    @for (item of items(); track item.id) {
      <li>{{ item.name }}</li>
    }
    ```
  - **Never use `*ngIf` or `*ngFor`** — these are not part of the project standard.
- **For component communication, use modern `input()` and `output()` functions:**
  - Example:
    ```typescript
    import { input, output, EventEmitter } from '@angular/core';

    export class MyComponent {
      readonly value = input<string>();
      readonly changed = output<string>();
    }
    ```
  - **Never use `@Input` or `@Output` decorators.**
- Prefer **Component Store**, **Signals**, **Standalone Components**, **modern RxJS**, and **dependency injection via providers**.
- Use **reactive architecture** and advanced state management (e.g., NgRx, Component Store, Signals).

### 2. **Nx Monorepo**
- Organize code into **libs** and **apps** following Nx best practices.
- Prefer **code reuse** and **responsibility isolation**.
- Use **Nx generators** and **executors** for scaffolding and automation.

### 3. **Design & UX**
- Prioritize **accessibility**, **responsiveness**, and **performance**.
- Follow modern mobile design standards (Material Design, Human Interface Guidelines, etc.).
- Use **themes** and customization via SCSS/CSS-in-JS as needed.

### 4. **General Best Practices**
- Always explain architectural and design decisions.
- Provide **commented** and **self-explanatory** code examples.
- Do not use legacy, deprecated code or workarounds.
- Prefer **automated tests** (unit and e2e) whenever possible.
- Document all functions, components, and libs.
- Prioritize reuse, responsibility isolation, and organization according to Nx and Atomic Design.
- Always check global modules (`settings-state-lib`, `shared`, `standalone-lib`) before creating new resources.

---

## Examples of What NOT to Use

```typescript
// DO NOT USE:
@Component({ ... })
export class MyComponent {
  @Input() value: string;
  @Output() changed = new EventEmitter<string>();
  ngOnInit() { ... }
  ngOnDestroy() { ... }
}

// DO NOT USE:
<div *ngIf="condition">...</div>
<li *ngFor="let item of items">...</li>
```

---

## Providers over NgModules

This workspace is standalone-only. **Do not introduce `NgModule`s** — not even the
`forRoot()`/`forChild()` wrappers that state and i18n libraries used to ship.

Each library exposes a provider function instead:

| Concern | Use |
|---|---|
| i18n setup | `provideTranslation()` — `@libs/translation` |
| Shared state slice | `provideSharedDataState()` — `@libs/store` |
| Profile feature state | `provideProfileState()` — `@libs/profile`, attached to the route |
| Root store / effects | `provideStore()`, `provideEffects()` |
| Router state | `provideRouterStore({ serializer: CustomSerializer })` |

Two rules learned the hard way:

1. **Never register the same concern twice.** `StoreRouterConnectingModule.forRoot({serializer})`
   *and* `provideRouterStore()` both provide `RouterStateSerializer`; the second silently
   won and the custom serializer never ran.
2. **Feature state belongs on the route, not in a component's `imports`.** Route-level
   `providers: [provideProfileState()]` creates the slice when the feature is entered
   and keeps the component testable.

## Templates

Import only what the template uses — `TranslatePipe`, `RouterLink`, `UpperCasePipe` —
rather than `CommonModule` or a barrel module. It keeps the component's dependencies
honest and helps the bundler.

## Module boundaries

Dependency rules live in `eslint.base.config.mjs` (the file every project extends),
**not** in the root `eslint.config.mjs`. Adding a library means adding its `scope:` tag
to `project.json` and a matching entry to `depConstraints`.
