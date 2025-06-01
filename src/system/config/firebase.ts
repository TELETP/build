// src/system/config/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { ConfigurationError } from './utils';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

const validateFirebaseConfig = (): FirebaseConfig => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  // Validate all fields are present
  Object.entries(config).forEach(([key, value]) => {
    if (!value) {
      throw new ConfigurationError(`Firebase ${key} is not configured`);
    }
  });

  return config as FirebaseConfig;
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  const firebaseConfig = validateFirebaseConfig();
  
  // Initialize Firebase
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  const message = error instanceof Error ? error.message : 'Firebase initialization failed';
  throw new ConfigurationError(`Firebase initialization error: ${message}`);
}

export { app as default, auth, db };
