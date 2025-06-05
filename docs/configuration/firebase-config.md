# Firebase Configuration

## Overview
This document details the Firebase configuration and setup for the dApp. Firebase is primarily used for Phone Authentication (via Firebase Auth) to verify users, and for storing wallet verification statuses in Firestore (specifically in the `verifications` collection).

## Configuration Structure

### Firebase Config Object
The Firebase configuration is initialized in `src/system/config/firebase.ts` using environment variables:
```typescript
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
```
The `firebase.ts` file validates that these environment variables are set.

## Service Initialization

### Firebase App
The core Firebase application instance is initialized as follows:
```typescript
import { initializeApp, getApps } from 'firebase/app';
// ... firebaseConfig definition
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
```

### Authentication
Firebase Authentication service is initialized for handling user sign-in and phone verification:
```typescript
import { getAuth } from 'firebase/auth';
export const auth = getAuth(app);
```

### Firestore
Firebase Firestore service is initialized for database operations, such as storing verification statuses:
```typescript
import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);
```

## Setup Instructions

### 1. Firebase Console Setup
1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Select your project (or create a new one).
3.  Navigate to Project Settings (click the gear icon by "Project Overview").
4.  Under the "General" tab, in the "Your apps" section, find your web app's configuration details. If you don't have a web app, create one.
5.  Ensure "Phone" is enabled as a sign-in method under Authentication > Sign-in method.
6.  Set up Firestore database and configure its security rules.

### 2. Environment Variables
Create or update your project's environment file (e.g., `.env.local`) with the Firebase configuration values obtained from the Firebase console:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```
Ensure these variables are correctly prefixed with `NEXT_PUBLIC_` to be accessible by the client-side Firebase SDK.

### 3. Required Services in Firebase Console
Ensure the following Firebase services are enabled and configured in your Firebase project:
-   **Authentication:** Primarily for phone number verification.
-   **Firestore Database:** To store verification statuses and related data in the `verifications` collection.

## Security Considerations

### Environment Variables
- The Firebase configuration values (apiKey, authDomain, etc.) prefixed with `NEXT_PUBLIC_` are intended for client-side initialization of the Firebase SDK. These are generally considered safe for client-side exposure as they are identifiers for your Firebase project and app, not secret API keys like server-side admin credentials.
- Always ensure that no sensitive server-side keys (e.g., Firebase Admin SDK credentials) are ever exposed in client-side code or prefixed with `NEXT_PUBLIC_`.
- Maintain separate Firebase projects or configurations for different environments (development, staging, production) if necessary.

### Authentication
- Configure proper authentication methods in the Firebase console (e.g., enable Phone Number sign-in).
- Implement reCAPTCHA verification for phone authentication to prevent abuse, as managed by `src/system/services/auth/recaptcha.ts`.

### Firestore Rules
- Implement robust Firestore security rules to control read/write access to your data.
- Validate data structure and content at the security rule level.
- It is critical to implement robust Firestore security rules, especially for the `verifications` collection, to ensure users can only access and modify their own data appropriately. (More details on these rules will be in `docs/services/firestore.md`).

## Usage Examples

### Accessing Firebase Services
Firebase services can be imported from `src/system/config/firebase.ts`:

```typescript
import { auth, db } from '@/system/config/firebase'; // Adjust path if needed based on tsconfig
import { doc, getDoc } from 'firebase/firestore';

// Authentication Example
const user = auth.currentUser;
if (user) {
  console.log("User is signed in:", user.uid, user.phoneNumber);
} else {
  console.log("User is not signed in.");
}

// Example Firestore read (e.g., fetching a verification status)
async function getVerificationStatus(walletAddress: string) {
  if (db) { // Ensure db is initialized
    const verificationDocRef = doc(db, 'verifications', walletAddress);
    try {
      const docSnap = await getDoc(verificationDocRef);
      if (docSnap.exists()) {
        console.log("Verification data:", docSnap.data());
        return docSnap.data();
      } else {
        console.log("No such verification document for wallet:", walletAddress);
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
    }
  } else {
    console.error("Firestore 'db' is not initialized.");
  }
  return null;
}
```

## Troubleshooting

### Common Issues
1.  **Firebase Initialization Errors:** Often due to missing or incorrect environment variables.
2.  **Authentication Setup Problems:** Incorrectly configured sign-in methods in Firebase console or issues with reCAPTCHA.
3.  **Firestore Permission Issues:** Firestore security rules blocking access. Check rules in Firebase Console > Firestore Database > Rules.
4.  **"No Firebase app '[DEFAULT]' has been created - call Firebase App.initializeApp()"**: Ensure Firebase is initialized before services are accessed.

### Solutions
-   Verify all `NEXT_PUBLIC_FIREBASE_*` environment variables are correctly set and accessible.
-   Check Firebase Console settings for Authentication (Phone sign-in enabled) and Firestore (database created, rules are appropriate).
-   Review Firestore security rules logic.
-   Monitor Firebase logs and browser console for detailed error messages.

## Monitoring

### Firebase Console
-   **Authentication:** Monitor sign-in activity, user counts, and error rates.
-   **Firestore Database:** Track usage (reads, writes, deletes), storage, and real-time connection data. Review security rule evaluations.
-   **Project Health:** Check overall project health and performance metrics.

### Application Monitoring
-   Implement client-side error tracking to capture issues related to Firebase interactions.
-   Monitor user flows involving phone verification and data storage/retrieval.
-   Track any custom metrics related to Firebase operations within the dApp.

This document provides a comprehensive guide to Firebase configuration. For details on specific service implementations, refer to their respective documentation files.