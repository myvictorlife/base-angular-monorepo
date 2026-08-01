import { Environment } from './environment.model';
import { firebaseConfig } from './generated/firebase.config';

export const environment: Environment = {
  production: false,
  environmentName: 'Local',
  baseUrl: 'http://localhost:8080',
  /**
   * Hardcoded `false`, unlike the other two variants: the `local` configuration
   * exists to run the app in isolation, and analytics from a developer machine
   * would pollute the project's real metrics. Flip it here if you need to debug
   * event logging.
   */
  firebaseEnabled: false,
  firebaseConfig,
};
