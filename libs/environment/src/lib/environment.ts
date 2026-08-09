import { Environment } from './environment.model';
import { firebaseConfig, firebaseEnabled } from './generated/firebase.config';
import { siteConfig, siteLinksEnabled } from './generated/site.config';

export const environment: Environment = {
  production: true,
  environmentName: 'Production',
  baseUrl: 'http://localhost:8080',
  // Both come from `config/firebase.json` — see `config/README.md`.
  firebaseEnabled,
  firebaseConfig,
  // From `config/site.json` / `SITE_REPO_URL`; absent means no source links.
  repoUrl: siteLinksEnabled ? siteConfig.repoUrl : null,
};
