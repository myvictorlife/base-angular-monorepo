# config/

One JSON file per integration. You paste the object a vendor console gives you —
nothing else.

```sh
cp config/firebase.example.json config/firebase.json
```

Then replace the contents of `config/firebase.json` with the object copied from Firebase
Console → Project settings → General → Your apps → SDK setup and configuration →
**Config**:

```json
{
  "apiKey": "AIzaSy...",
  "authDomain": "my-app.firebaseapp.com",
  "projectId": "my-app",
  "storageBucket": "my-app.firebasestorage.app",
  "messagingSenderId": "123456789012",
  "appId": "1:123456789012:web:abc123",
  "measurementId": "G-ABCDEF1234"
}
```

The console shows JavaScript, not JSON — unquoted keys, single quotes, a trailing comma,
a leading `const firebaseConfig =`. **Paste it as-is anyway.** The reader normalises all
of that. Quoting the keys afterwards only makes your editor stop underlining the file.

> Prefer the exact JSON with no editing? With the CLI installed and authenticated:
> `firebase apps:sdkconfig web --project <project-id> --json`

## What happens to it

`tools/generate-config.mjs` compiles every file here into a typed module under
`libs/environment/src/lib/generated/`, on `npm install` and before every Nx build, serve
and test. `npm run config:generate` forces it.

| Source                 | Generated                                               | Consumed by                                                 |
| ---------------------- | ------------------------------------------------------- | ----------------------------------------------------------- |
| `config/firebase.json` | `libs/environment/src/lib/generated/firebase.config.ts` | `environment.firebaseConfig`, `environment.firebaseEnabled` |
| ↳ its `projectId`      | `hosting/.firebaserc`                                   | `npm run build:deploy:firebase`                             |
| `config/site.json`     | `libs/environment/src/lib/generated/site.config.ts`     | `environment.repoUrl` — "view source" links in the app      |

**`config/*.json` and everything generated from it are git-ignored.** Only the
`*.example.json` files are committed. This repo is a public template: a credential in a
tracked file gets published with it.

**A missing file is a supported state.** The config comes out empty, `firebaseEnabled`
is `false`, and the app builds and runs with the integration off — a fresh clone works
before any vendor account exists.

`config/site.json` follows the same rule with identity instead of credentials: it holds
the URL of _your_ repository (`{ "repoUrl": "https://github.com/you/your-repo" }`), and
while it is absent the app renders no "view source on GitHub" links at all. In CI the
deploy workflows derive `SITE_REPO_URL` from the repository that is building, so a
fork's deploy links to the fork automatically.

## Are these secrets?

A Firebase web config is not one: every Firebase app ships it inside its client bundle,
and access is governed by Security Rules and API key restrictions. It lives here so that
a clone of this template never reports into someone else's project, and so you edit one
file instead of three.

Some other integration's key may be a real secret. The rule that makes this safe either
way: **nothing in `config/` is ever committed.** Keys that must not reach a browser at
all belong in a backend, not in any file the frontend build reads.

## Adding another integration

1. Declare its interface in `libs/environment/src/lib/environment.model.ts`.
2. Append an entry to `CONFIGS` in `tools/generate-config.mjs` — name, source file,
   output path, type name, keys, and which of them are required.
3. Commit a `config/<name>.example.json` showing the shape.

The generator picks it up from there; no build wiring to touch.

## `.env` vs. this folder

|                           | Holds                                                   | Read by           |
| ------------------------- | ------------------------------------------------------- | ----------------- |
| `config/*.json`           | objects pasted from a console                           | the generator     |
| [`.env`](../.env.example) | scalars: single values, per-machine or per-CI overrides | the generator, Nx |

Any individual key can also be overridden by a real environment variable
(`FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, …), which is how CI supplies credentials with
nothing on disk. Those win over the file.
