export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

/**
 * Where this deployment's source lives. Comes from `config/site.json` or the
 * `SITE_REPO_URL` env var — never committed, so a fork's build links to its own
 * repository or to nothing, not to the template's.
 */
export interface SiteConfig {
  repoUrl: string;
}

/**
 * Shape every environment file must satisfy. Typing them all against this stops
 * the variants from drifting apart — a missing key is now a compile error in the
 * configuration that uses it, not a surprise at build time.
 */
export interface Environment {
  production: boolean;
  environmentName: string;
  baseUrl: string;
  firebaseEnabled: boolean;
  firebaseConfig: FirebaseConfig;
  /** `null` when no repo URL is configured — every "view source" link stays unrendered. */
  repoUrl: string | null;
}
