import { Environment } from './environment.model';
import { firebaseConfig, firebaseEnabled } from './generated/firebase.config';

export const environment: Environment = {
  production: true,
  environmentName: 'Production',
  baseUrl: 'http://localhost:8080',
  // Both come from `config/firebase.json` — see `config/README.md`.
  firebaseEnabled,
  firebaseConfig,
};
