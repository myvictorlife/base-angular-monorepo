# environment

Build-time configuration. One file per target, swapped by Angular's `fileReplacements`.

**Tag:** `scope:environment-lib` — **may not depend on any other library.**

## Import

```ts
import { environment, commonPaths } from '@libs/environment';
```

## Files

| File                         | Used by                                                                                    | `production` |
| ---------------------------- | ------------------------------------------------------------------------------------------ | ------------ |
| `environment.ts`             | `--configuration=production` (default)                                                     | `true`       |
| `environment.development.ts` | `--configuration=development` (`nx serve`)                                                 | `false`      |
| `environment.local.ts`       | `--configuration=local`                                                                    | `false`      |
| `environment.model.ts`       | the `Environment` interface all three implement, plus every integration's config interface | —            |
| `generated/`                 | **generated + git-ignored** — one module per `config/*.json`                               | —            |
| `api.paths.ts`               | API path constants (`commonPaths`)                                                         | —            |

The replacements are declared in `apps/demo-app/project.json` under each
configuration's `fileReplacements`.

## Why the `Environment` interface exists

Every variant is typed `: Environment`. Without it the files drift: `environment.local.ts`
once lacked `firebaseEnabled`/`firebaseConfig` entirely, and nobody noticed because no
build referenced it. A missing key is now a compile error.

**If you add a key, add it to `environment.model.ts` first** — the compiler then tells
you which variants still need it.

## Gotcha

`production` is not "is this a real deployment", it is "should production behaviour be
on". Devtools and verbose logging key off it, so a development variant with
`production: true` silently disables them. Keep it `false` for anything but production.

## `generated/` — credentials never live in this folder

Nothing under `generated/` is edited by hand, and nothing in it is committed. Each
module is compiled by `tools/generate-config.mjs` from one file in `config/`, where the
developer pastes the object their vendor console handed them:

```
config/firebase.json ──generate-config.mjs──▶ generated/firebase.config.ts ──▶ environment*.ts
                                           └─▶ hosting/.firebaserc
```

The environment files then just re-export what the app needs:

```ts
import { firebaseConfig, firebaseEnabled } from './generated/firebase.config';
```

Regeneration is automatic — `postinstall`, `npm start`, and every Nx `build`/`serve`/
`test` via `targetDefaults.dependsOn` in `nx.json`. `npm run config:generate` forces it.

> A **running** `nx serve` will not regenerate: `dependsOn` fires when the target starts.
> Change a `config/*.json` mid-session and you need `npm run config:generate` (the
> watcher then picks the file up), or a restart.

Setup and the "add another integration" recipe live in
[`../../config/README.md`](../../config/README.md).

**No config file is a supported state**, not a broken one — values come out empty, the
`*Enabled` flag is `false`, and the corresponding service no-ops. A fresh clone builds
and runs before any vendor account exists.

`firebaseEnabled` is derived, never typed by hand: `true` when `apiKey`, `projectId` and
`appId` are all present. The one exception is `environment.local.ts`, which hardcodes
`false` so a developer machine never writes into the project's real analytics.

**Adding an integration touches `environment.model.ts` first.** Its interface is the
contract the generated module is typed against — declare it there, then register the
integration in `tools/generate-config.mjs`.
