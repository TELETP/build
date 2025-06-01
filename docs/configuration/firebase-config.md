# Firebase Configuration

## Overview
This document details the Firebase configuration and setup for the XTNCT NinjaAI ICO DApp.

## Configuration Structure

### Firebase Config Object
The Firebase configuration is initialized in `src/system/config/firebase.ts`:
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

## Service Initialization

### Firebase App
```typescript
import { initializeApp, getApps } from 'firebase/app';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
```

### Authentication49
```typescript
import { getAuth } from 'firebase/auth';
export const auth = getAuth(app);
```

### Firestore
```typescript
import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);
```

## Setup Instructions

### 1. Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Project Settings (gear icon)
4. Find your configuration in the "Your apps" section

### 2. Environment Variables
Create or update `.env.local` with Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3. Required Services
- Authentication (Phone Authentication)
- Firestore Database
- Firebase Storage (optional)

## Security Considerations

### Environment Variables
- Never expose Firebase config in client-side code
- Use environment variables for all sensitive data
- Maintain separate configurations for different environments

### Authentication
- Configure proper authentication methods
- Set up phone number verification
- Implement proper security rules

### Firestore Rules
- Implement proper security rules
- Control read/write access
- Validate data structure

## Usage Examples

### Accessing Firebase Services
```typescript
import { auth, db } from '@/system/config/firebase';

// Authentication
const user = auth.currentUser;

// Firestore
const userDoc = await db.collection('users').doc(userId).get();
```

## Troubleshooting

### Common Issues
1. Firebase initialization errors
2. Authentication setup problems
3. Firestore permission issues

### Solutions
- Verify environment variables
- Check Firebase Console settings
- Review security rules
- Monitor Firebase logs

## Monitoring

### Firebase Console
- Monitor authentication status
- Track Firestore usage
- Review error logs

### Application Monitoring
- Implement error tracking
- Monitor authentication flows
- Track database operations