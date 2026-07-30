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
}
