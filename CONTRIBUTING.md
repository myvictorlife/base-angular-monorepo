# Contributing

Thanks for taking the time. This repository is a **template**, which shapes what a
good contribution looks like: changes should make the starting point better for
everyone who forks it, not encode one product's requirements.

## What belongs here

**Good candidates**

- Fixes to the architecture the docs describe (boundaries, providers, lazy loading)
- Keeping the stack current — Angular, Nx, NgRx, Tailwind upgrades
- Tests, accessibility fixes, documentation that closes a gap between `docs/` and
  the code
- Making an existing coupling optional, the way Firebase analytics now is

**Usually not**

- A feature only your product needs. `@libs/profile` and `@libs/settings` exist to
  demonstrate two _shapes_ of feature library; a third one has to teach something
  neither of them does.
- Swapping a core dependency for your preference without a concrete argument
- New runtime dependencies. Every one of them is inherited by every fork.

Open an issue before a large change. It is cheaper than a rejected pull request.

## Getting set up

```sh
npm install          # also generates the integration configs (see config/README.md)
npm start            # http://localhost:4200
```

Node `^22.22.3`, `^24.15.0` or `>=26` — required by Angular 22.

You do **not** need a Firebase project. Without a `config/firebase.json`,
`firebaseEnabled` is `false`, `ANALYTICS` resolves to `NoopAnalytics`, and
everything runs.

## Before you push

```sh
npm run lint:all
npm run test:all
npx nx e2e demo-app
npx nx build demo-app --configuration=production
```

CI runs the same four. `nx affected` is fine locally; CI runs everything.

## Ground rules the linter enforces

These are not style preferences — the build fails on them:

- `@if` / `@for`, never `*ngIf` / `*ngFor`
- `input()` / `output()` functions, never `@Input` / `@Output` decorators
- `ChangeDetectionStrategy.OnPush` on every component
- Standalone components; no `NgModule`
- Import what a template uses, not `CommonModule`
- Library dependency rules from `eslint.base.config.mjs` — a lib may only import
  from the tags listed for its own tag

A new library must be tagged `scope:<something>` **and** be given an entry in
`depConstraints`. A tag with no entry there is unconstrained, which quietly defeats
the point. See [`docs/skills/module-boundaries.md`](docs/skills/module-boundaries.md).

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), enforced by
commitlint on every commit:

```
feat(settings): add reduced-motion preference
fix(header): keep the language dropdown open on keyboard focus
docs(readme): explain why this exists over a bare nx generator
chore(deps): upgrade Angular to 22.1
```

Allowed types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
`build`, `ci`, `chore`, `revert`. The scope is usually the project name.

## Secrets

**Nothing in `config/` or `.env` is ever committed.** Only the `*.example.json`
files are. The pre-commit hook rejects a populated Firebase `apiKey` in a tracked
file, but it is a backstop, not the rule.

Firebase _web_ config values are not secrets — they ship in every client bundle by
design, and Google documents them as public. They are kept out of git for two
other reasons: a fork must never report analytics into someone else's project, and
one file beats three. Real secrets — service account JSON, private API keys —
belong in GitHub Actions secrets and must never reach a frontend bundle. See
[`config/README.md`](config/README.md) and
[`docs/skills/firebase-deploy.md`](docs/skills/firebase-deploy.md).

## Pull requests

- One concern per pull request
- Update `docs/` when behaviour changes — a doc describing something that no longer
  exists is worse than no doc
- Add a `CHANGELOG.md` entry under `Unreleased`
- A pull request gets a Firebase preview URL automatically; link to it if the change
  is visual

## Code of conduct

Participation is covered by [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).
