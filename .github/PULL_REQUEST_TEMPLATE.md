<!-- Title should follow Conventional Commits, e.g. feat(settings): add reduced-motion -->

## What and why

<!-- The problem first, the change second. Link the issue if there is one. -->

Closes #

## How to verify

<!-- The commands or the click-path a reviewer should follow. If the change is
     visual, link the Firebase preview URL that CI posted on this PR. -->

## Checklist

- [ ] `npm run lint:all` passes
- [ ] `npm run test:all` passes, and new behaviour has tests
- [ ] `npx nx build demo-app --configuration=production` passes
- [ ] `docs/` updated if behaviour changed
- [ ] `CHANGELOG.md` entry added under `Unreleased`
- [ ] New library is tagged `scope:*` **and** has a `depConstraints` entry
- [ ] No credentials, project ids or `.env` contents in the diff

## Impact on existing forks

<!-- Renamed lib, changed provider signature, moved config file? Say so here, or
     write "none". -->
