export const environment = {
  production: true,
  environmentName: 'Production',
  baseUrl: 'http://localhost:8080',
  firebaseEnabled: false, // auto-substituted by backend → true when Firebase is configured
  firebaseConfig: {
    apiKey: '',                                                      // Firebase Console → Project Settings → Your apps
    authDomain: 'YOUR_FIREBASE_PROJECT_ID.firebaseapp.com',         // auto-substituted by backend
    projectId: 'YOUR_FIREBASE_PROJECT_ID',                          // auto-substituted by backend
    storageBucket: 'YOUR_FIREBASE_PROJECT_ID.firebasestorage.app',  // auto-substituted by backend
    messagingSenderId: '',                                           // Firebase Console → Project Settings → Your apps
    appId: '',                                                       // Firebase Console → Project Settings → Your apps
    measurementId: '',                                               // Firebase Console → Project Settings → Your apps (Analytics)
  },
};
