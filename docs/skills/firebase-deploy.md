# Skill: Firebase Hosting Deploy

This project includes a ready-to-use Firebase Hosting setup for deploying the Angular app as a SPA.
Follow this guide every time you set up or deploy to a new Firebase project.

---

## How it works

The deploy pipeline has three steps that always run in order:

1. **Build** — Nx compiles the app to `dist/apps/genai-app/browser/`
2. **Copy** — the `dist/` folder is copied into `hosting/`, making it available to Firebase CLI
3. **Deploy** — Firebase CLI runs from inside `hosting/` and uploads the built files

```
project root
├── dist/apps/genai-app/browser/   ← Angular build output
└── hosting/
    ├── .firebaserc                 ← Firebase project binding
    ├── firebase.json               ← Hosting configuration
    └── dist/                      ← Created at deploy time (gitignored)
        └── apps/genai-app/browser/
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

## 2. Configure the Firebase project

**`hosting/.firebaserc`** — replace `YOUR_FIREBASE_PROJECT_ID` with the real Firebase project ID (found in the Firebase Console):

```json
{
  "projects": {
    "default": "my-firebase-project"
  },
  "targets": {
    "my-firebase-project": {
      "hosting": {
        "app": [
          "my-firebase-project"
        ]
      }
    }
  }
}
```

**`libs/environment/src/lib/environment.ts`** — fill in the `firebaseConfig` with the credentials from the Firebase Console → Project Settings → Your apps → SDK setup:

```typescript
export const environment = {
  production: true,
  environmentName: 'Production',
  baseUrl: 'https://your-api.example.com',
  firebaseConfig: {
    apiKey: 'AIzaSy...',
    authDomain: 'my-firebase-project.firebaseapp.com',
    projectId: 'my-firebase-project',
    storageBucket: 'my-firebase-project.firebasestorage.app',
    messagingSenderId: '123456789',
    appId: '1:123456789:web:abc123',
  },
};
```

Do the same for `environment.development.ts` with the development project credentials (can be the same project).

---

## 3. Available scripts

| Script | Command | What it does |
|---|---|---|
| `build:deploy:firebase` | Full pipeline | Build → copy dist → deploy |
| `utils:copy:dist` | Copy only | Copies `./dist` into `./hosting/` |
| `deploy:firebase` | Deploy only | Runs `firebase deploy` from `./hosting/` |

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
      "public": "dist/apps/genai-app/browser",
      "rewrites": [{ "source": "**", "destination": "/index.html" }],
      "headers": [
        {
          "source": "index.html",
          "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
        },
        {
          "source": "**/*.@(js|css|json|ico|png|jpg|jpeg|svg|ttf|woff|woff2|eot)",
          "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000" }]
        }
      ]
    }
  ]
}
```

Do not change the `public` path — it must match the Angular build output path defined in `apps/genai-app/project.json`.

---

## 5. Adding a new app to the same Firebase project

If the monorepo grows to include a second app (e.g., `apps/admin`), add a second hosting target in `firebase.json`:

```json
{
  "hosting": [
    {
      "target": "app",
      "public": "dist/apps/genai-app/browser",
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

Register the new target in `.firebaserc`:

```json
{
  "targets": {
    "my-firebase-project": {
      "hosting": {
        "app": ["my-firebase-project-app"],
        "admin": ["my-firebase-project-admin"]
      }
    }
  }
}
```

---

## Checklist before deploying

- [ ] Firebase CLI installed (`firebase --version`)
- [ ] Authenticated (`firebase login`)
- [ ] `hosting/.firebaserc` has the correct project ID (no `YOUR_FIREBASE_PROJECT_ID` placeholder)
- [ ] `firebaseConfig` in environment files is filled with real credentials
- [ ] `hosting/dist/` is gitignored (check `.gitignore`)
- [ ] `hosting/.firebase/` is gitignored (check `.gitignore`)
