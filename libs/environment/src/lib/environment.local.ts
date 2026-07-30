import { Environment } from './environment.model';

export const environment: Environment = {
  production: false,
  environmentName: 'Local',
  baseUrl: 'http://localhost:8080',
  firebaseEnabled: false,
  firebaseConfig: {
    apiKey: '',
    authDomain: 'YOUR_FIREBASE_PROJECT_ID.firebaseapp.com',
    projectId: 'YOUR_FIREBASE_PROJECT_ID',
    storageBucket: 'YOUR_FIREBASE_PROJECT_ID.firebasestorage.app',
    messagingSenderId: '',
    appId: '',
    measurementId: '',
  },
};
