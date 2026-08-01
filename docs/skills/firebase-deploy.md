# Skill: Firebase Hosting Deploy

This project includes a ready-to-use Firebase Hosting setup for deploying the Angular app as a SPA.
Follow this guide every time you set up or deploy to a new Firebase project.

> Setting up a Firebase project for the first time? [`hosting/README.md`](../../hosting/README.md)
> covers the console side click by click, with screenshots. This page is the reference for
> the repo side: scripts, configuration and CI.

---

## How it works

The deploy pipeline has three steps that always run in order:

1. **Build** — Nx compiles the app to `dist/apps/demo-app/browser/`
2. **Copy** — the `dist/` folder is copied into `hosting/`, making it available to Firebase CLI
3. **Deploy** — Firebase CLI runs from inside `hosting/` and uploads the built files

```
project root
├── dist/apps/demo-app/browser/   ← Angular build output
└── hosting/
    ├── .firebaserc                 ← Firebase project binding
    ├── firebase.json               ← Hosting configuration
    └── dist/                      ← Created at deploy time (gitignored)
        └── apps/demo-app/browser/
```

The `firebase.json` is located inside `hosting/` and its `public` path is relative to that directory, which is why the copy step is needed before deploying.

---

## 1. Prerequisites

Install the Firebase CLI globally if not already installed:

```sh
npm install -g firebase-tools
```

Authenticate:

```sh
firebase login
```

---

## 2. Configure the Firebase project — one file, `config/firebase.json`

Do **not** edit `hosting/.firebaserc` or the `environment*.ts` files. Both the deploy
target and the app's Firebase config are generated from one JSON file, so there is a
single place to fill in — and no credential ever reaches a tracked file.

```sh
cp config/firebase.example.json config/firebase.json
```

Open Firebase Console → Project settings → General → Your apps → SDK setup and
configuration → **Config**, and paste the object into that file:

```json
{
  "apiKey": "AIzaSy...",
  "authDomain": "my-firebase-project.firebaseapp.com",
  "projectId": "my-firebase-project",
  "storageBucket": "my-firebase-project.firebasestorage.app",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abc123",
  "measurementId": "G-ABCDEF1234"
}
```

The console shows JavaScript, not JSON. Paste it as copied anyway — unquoted keys,
single quotes, trailing commas, `//` comments and a leading `const firebaseConfig =` are
all normalised by the reader. For byte-exact JSON instead:
`firebase apps:sdkconfig web --project <id> --json`.

`tools/generate-config.mjs` then writes, on `npm install` and before every Nx
build/serve/test:

| Generated file                                          | Purpose                           | Tracked |
| ------------------------------------------------------- | --------------------------------- | ------- |
| `libs/environment/src/lib/generated/firebase.config.ts` | what the app compiles against     | no      |
| `hosting/.firebaserc`                                   | project + site the CLI deploys to | no      |

Force a regeneration with `npm run config:generate`.

Set `FIREBASE_HOSTING_SITE` in `.env` only when the Hosting site id differs from the
project id (extra sites created under Console → Hosting). It defaults to the project id.

**Deploying from CI:** skip the config file entirely and export the values as real
environment variables — `FIREBASE_API_KEY`, `FIREBASE_PROJECT_ID`, `FIREBASE_APP_ID`,
`FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_MEASUREMENT_ID`. They take precedence over the
file, so GitHub Actions secrets work with no extra wiring.

> A Firebase web config is not a secret — it ships inside the client bundle of every
> Firebase app, and access is governed by Security Rules and API key restrictions. It
> lives in `config/` so that a clone of this template never reports into your project,
> and so you edit one file instead of three.

---

## 3. Available scripts

| Script                  | Command       | What it does                             |
| ----------------------- | ------------- | ---------------------------------------- |
| `build:deploy:firebase` | Full pipeline | Build → copy dist → deploy               |
| `utils:copy:dist`       | Copy only     | Copies `./dist` into `./hosting/`        |
| `deploy:firebase`       | Deploy only   | Runs `firebase deploy` from `./hosting/` |

**Full pipeline (most common):**

```sh
npm run build:deploy:firebase
```

**Deploy only** (if the app is already built and dist is already copied):

```sh
npm run deploy:firebase
```

---

## 4. Firebase hosting configuration

**`hosting/firebase.json`** is pre-configured for Angular SPA deployments:

- All routes rewrite to `/index.html` — required for Angular client-side routing
- `index.html` is served with `no-cache` headers so users always get the latest version
- Static assets (JS, CSS, images, fonts) are cached for 1 year for performance

```json
{
  "hosting": [
    {
      "target": "app",
      "public": "dist/apps/demo-app/browser",
      "rewrites": [{ "source": "**", "destination": "/index.html" }],
      "headers": [
        {
          "source": "index.html",
          "headers": [
            {
              "key": "Cache-Control",
              "value": "no-cache, no-store, must-revalidate"
            }
          ]
        },
        {
          "source": "**/*.@(js|css|json|ico|png|jpg|jpeg|svg|ttf|woff|woff2|eot)",
          "headers": [
            { "key": "Cache-Control", "value": "public, max-age=31536000" }
          ]
        }
      ]
    }
  ]
}
```

Do not change the `public` path — it must match the Angular build output path defined in `apps/demo-app/project.json`.

---

## 5. Adding a new app to the same Firebase project

If the monorepo grows to include a second app (e.g., `apps/admin`), add a second hosting target in `firebase.json`:

```json
{
  "hosting": [
    {
      "target": "app",
      "public": "dist/apps/demo-app/browser",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    },
    {
      "target": "admin",
      "public": "dist/apps/admin/browser",
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    }
  ]
}
```

The second target also has to be registered in `.firebaserc` — which is generated, so
teach the generator about it rather than editing the output. In
`tools/generate-config.mjs`, extend `writeFirebaseRc`:

```js
targets: { [project]: { hosting: { app: [site], admin: [`${project}-admin`] } } },
```

Editing `hosting/.firebaserc` by hand works until the next build, which overwrites it.

---

## 6. Automated deploys (GitHub Actions)

Two workflows ship with the template:

| Workflow                        | Trigger                   | Result                                                                                                                     |
| ------------------------------- | ------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/deploy.yml`  | push to `main`, or manual | Deploys to the **live** channel — `https://<project-id>.web.app`                                                           |
| `.github/workflows/preview.yml` | every pull request        | Deploys a **preview channel**, comments the URL on the PR, expires after 7 days, then runs the Playwright suite against it |

### Repository secrets

Settings → Secrets and variables → Actions → **New repository secret**.

| Secret                         | Value                                  | Actually secret?                        |
| ------------------------------ | -------------------------------------- | --------------------------------------- |
| `FIREBASE_SERVICE_ACCOUNT`     | The full JSON key of a service account | **Yes.** This one grants deploy access. |
| `FIREBASE_PROJECT_ID`          | e.g. `base-angular-monorepo`           | No                                      |
| `FIREBASE_API_KEY`             | `AIzaSy…`                              | No                                      |
| `FIREBASE_AUTH_DOMAIN`         | `<project-id>.firebaseapp.com`         | No                                      |
| `FIREBASE_STORAGE_BUCKET`      | `<project-id>.firebasestorage.app`     | No                                      |
| `FIREBASE_MESSAGING_SENDER_ID` | numeric                                | No                                      |
| `FIREBASE_APP_ID`              | `1:…:web:…`                            | No                                      |
| `FIREBASE_MEASUREMENT_ID`      | `G-…`                                  | No                                      |

Only the first one is a credential. The rest are stored as secrets so a **fork**
never builds with this project's identity and starts reporting analytics into it —
they are shipped publicly in the bundle regardless. `tools/generate-config.mjs`
reads each of them from the environment, which is why CI needs no `config/` file.

To create the service account:

```sh
firebase init hosting:github     # generates the key and sets the secret for you
```

or, by hand: Google Cloud Console → IAM & Admin → Service Accounts → create one
with **Firebase Hosting Admin**, add a JSON key, and paste the whole file into
`FIREBASE_SERVICE_ACCOUNT`.

> Do not use `firebase login:ci` tokens. They are long-lived, carry your full user
> permissions, and cannot be scoped.

---

## 7. Locking down the web API key

The config in the bundle is public. That is by design, and the protection lives
elsewhere — do all four of these once the site is live.

**1. Restrict the API key to your domains.** Google Cloud Console → APIs &
Services → Credentials → the _Browser key (auto created by Firebase)_ → Application
restrictions → **HTTP referrers**:

```
https://<project-id>.web.app/*
https://<project-id>.firebaseapp.com/*
https://<project-id>--*.web.app/*      ← preview channels
http://localhost:4200/*
```

Under **API restrictions**, limit it to what the app actually calls — for an
analytics-only setup that is the Firebase Installations API and Google Analytics.
Anything else is surface you are not using.

**2. Turn on App Check.** Console → App Check → register the web app with
**reCAPTCHA Enterprise**, then enforce it per service. This is the real answer to
"someone copied my apiKey": it attests that a request came from your app, and a
copied key on another origin fails attestation.

**3. Write Security Rules** before enabling Firestore, Storage or Realtime
Database. The default rules in test mode are open to the internet and expire
silently. This template uses none of those services, so there is nothing to write
yet — the moment you add one, this becomes the most important item on the list.

**4. Set a budget alert.** Google Cloud Console → Billing → Budgets & alerts.
Abuse of a public endpoint shows up as a bill.

### What must never reach the frontend

Anything that grants access on its own: service account keys, an LLM provider's
API key, a database password, a private third-party token. No amount of build-time
substitution makes these safe — the bundle is readable. They belong behind a Cloud
Function or Cloud Run service that holds them in Secret Manager, and the frontend
calls that.

---

## Checklist before deploying

- [ ] Firebase CLI installed (`firebase --version`)
- [ ] Authenticated (`firebase login`)
- [ ] `config/firebase.json` exists and holds your config object (`cp config/firebase.example.json config/firebase.json`)
- [ ] `npm run config:generate` prints `firebase: enabled — <your-project>`
- [ ] `config/firebase.json`, `hosting/.firebaserc` and `libs/environment/src/lib/generated/` are gitignored — none of them should ever appear in `git status`
- [ ] `hosting/dist/` and `hosting/.firebase/` are gitignored (check `.gitignore`)

For an automated deploy, additionally:

- [ ] `FIREBASE_SERVICE_ACCOUNT` set as a repository secret
- [ ] The seven `FIREBASE_*` config secrets set
- [ ] API key restricted to your domains (section 7)
- [ ] App Check enabled and enforced
- [ ] Budget alert configured
