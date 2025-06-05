# Firestore Usage in the dApp

## Overview
Firestore is utilized in the dApp in two main ways:

1.  **Directly by `VerificationService`:** For managing detailed phone verification statuses, attempts, and cooldowns in the `verifications` collection. This service uses core Firestore SDK methods.
2.  **Through `FirestoreService` Class:** A dedicated service class (`src/system/services/firestore/index.ts`) provides structured methods for interacting with the `users` and `transactions` collections.

This document outlines the data models, service methods, and security considerations for Firestore usage.

## `verifications` Collection (Managed by `VerificationService`)

*   **Purpose:** Stores the detailed phone verification status for each wallet address. This collection is the primary source of truth for verification state, including attempts and cooldown periods.
*   **Interaction:** `VerificationService` (from `src/system/services/auth/verification.ts`) interacts with this collection directly using Firestore SDK methods like `getDoc` and `updateDoc` (from `firebase/firestore`). For full details on `VerificationService`, see its dedicated documentation [here](./auth/verification-service.md).
*   **Document Key:** Wallet address (string).
*   **Data Structure:**
    ```typescript
    // From src/system/services/auth/verification.ts
    export interface VerificationStatus {
      isVerified: boolean;
      lastVerified: Date | null; // Firestore Timestamp
      attempts: number;
      cooldown?: Date; // Firestore Timestamp, timestamp until which the user is in a cooldown period
      // Note: VerificationService also implicitly adds/updates an 'updatedAt' Firestore Timestamp.
    }
    ```

## Data Models (Managed by `FirestoreService`)

The `FirestoreService` class (`src/system/services/firestore/index.ts`) manages the following collections and data models:

### `users` Collection (Managed by `FirestoreService`)
Stores user-specific information linked to their wallet address.

**Document Key:** User's wallet address.

**Interface (`FirestoreUser`):**
```typescript
// From src/system/services/firestore/types.ts (implicitly, based on FirestoreService)
interface FirestoreUser {
  id: string; // Usually the wallet address
  wallet: string;
  smsVerified: boolean;
  lastSmsVerification: Date; // Firestore Timestamp
  hasProjectTokens: boolean; // Example field, adjust as per actual use
  createdAt: Date; // Firestore Timestamp
  updatedAt: Date; // Firestore Timestamp
}
```

**Note on Data Overlap with `verifications` Collection:**

The `FirestoreUser` model includes `smsVerified: boolean` and `lastSmsVerification: Date` fields. This functionality overlaps with the dedicated `verifications` collection, which is managed by [`VerificationService`](./auth/verification-service.md) and serves as a more comprehensive record of phone verification status (including attempts, cooldowns, and precise update timestamps).

**Recommendation for Rectification:**
*   **Single Source of Truth:** The `verifications` collection should be considered the single source of truth for all phone verification-related data.
*   **Deprecation/Synchronization:** To avoid data inconsistency and confusion:
    1.  Consider deprecating the `smsVerified` and `lastSmsVerification` fields from the `FirestoreUser` model.
    2.  If user-specific aggregated data is still needed directly on the user object, these fields could be populated by reading from the `verifications` collection when a `FirestoreUser` object is constructed or accessed. Alternatively, client-side logic could fetch from both sources if needed, but treating `verifications` as primary is key.
    3.  Any updates to verification status should exclusively go through [`VerificationService`](./auth/verification-service.md) to the `verifications` collection. The `FirestoreService.updateUserVerification` method should be reviewed and potentially deprecated or refactored to use [`VerificationService`](./auth/verification-service.md).
*   **Rationale:** Consolidating the source of truth simplifies logic, reduces the risk of stale or conflicting data, and makes the system easier to maintain. The `verifications` collection already provides richer information.

### `transactions` Collection (Managed by `FirestoreService`)
Stores records of user transactions within the dApp.

**Document Key:** Auto-generated Firestore ID or a transaction hash.

**Interface (`FirestoreTransaction`):**
```typescript
// From src/system/services/firestore/types.ts (implicitly, based on FirestoreService)
interface FirestoreTransaction {
  id: string;
  userId: string; // Wallet address of the user
  wallet: string; // Wallet address (can be redundant if userId is wallet)
  amount: number;
  tokenSymbol: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date; // Firestore Timestamp
  // Potentially other fields like transactionHash, type, description
}
```

## `FirestoreService` Methods (`src/system/services/firestore/index.ts`)

The `FirestoreService` class provides the following methods for interacting with the `users` and (implicitly) `transactions` collections:

### User Operations
*   `getUser(wallet: string): Promise<FirestoreUser | null>`: Retrieves user data from the `users` collection based on the wallet address.
*   `createUser(userData: Omit<FirestoreUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirestoreUser>`: Creates a new user document in the `users` collection. `id` is set to `userData.wallet`, and `createdAt`/`updatedAt` timestamps are added.
*   `updateUserVerification(wallet: string, verified: boolean): Promise<void>`: Updates the `smsVerified` and `lastSmsVerification` fields in a user's document in the `users` collection.
    *   **Note:** This method's functionality significantly overlaps with `VerificationService` and the `verifications` collection. It should be reviewed and potentially deprecated or refactored to ensure data consistency, as recommended in the "Note on Data Overlap" section above.

### Transaction Operations (Conceptual - based on typical needs)
The current `FirestoreService` from `index.ts` does not explicitly show transaction methods, but typically it would include:
*   `recordTransaction(transactionData: Omit<FirestoreTransaction, 'id' | 'timestamp'>): Promise<FirestoreTransaction>`: Records a new transaction in the `transactions` collection.
*   `getTransactionHistory(wallet: string): Promise<FirestoreTransaction[]>`: Retrieves transaction history for a given user/wallet.

## Error Handling

### Custom Error Type (`FirestoreError`)
A custom error class can be used for more specific error handling related to Firestore operations.
```typescript
// Conceptual - if a more specific error type is needed for FirestoreService
export class FirestoreError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'FirestoreError';
  }
}
```
The `VerificationService` uses its own `VerificationError` for its specific operations.

### Common Error Scenarios
*   **Document Not Found:** Handled by returning `null` (e.g., `getUser`) or by application logic.
*   **Permission Denied:** Firestore security rules prevent an operation. This will result in an error from the Firestore SDK.
*   **Network Errors:** The Firebase SDK provides offline capabilities for some scenarios, but robust error handling should account for network issues.

## Security Rules

Effective security rules are critical for protecting data in Firestore.

### `users` Collection Security Rules (Conceptual)
```javascript
// Conceptual rules for 'users' collection
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} { // userId is expected to be the wallet address
      // Allow read if the requesting user is authenticated and their ID matches the document ID.
      // Assumes `request.auth.uid` is set to the user's wallet address upon primary authentication.
      allow read: if request.auth != null && request.auth.uid == userId;

      // Allow create if the user is authenticated and the document ID matches their auth UID.
      allow create: if request.auth != null && request.auth.uid == userId;

      // Allow update if the user is authenticated, their ID matches,
      // and they are not trying to change immutable fields like 'wallet' or 'createdAt'.
      // Specific logic for `smsVerified` and `lastSmsVerification` should be carefully considered
      // due to the overlap with the `verifications` collection. Ideally, these fields are deprecated
      // or updated server-side.
      allow update: if request.auth != null && request.auth.uid == userId
                      // && request.resource.data.wallet == resource.data.wallet // Wallet is immutable
                      // && request.resource.data.createdAt == resource.data.createdAt; // CreatedAt is immutable
                      // Further rules needed if client can update verification fields here.
    }
    // ... (rules for other collections like 'transactions')
  }
}
```

### `verifications` Collection Security Rules (Conceptual)
```javascript
// Conceptual rules for 'verifications' collection
// These rules are defined under the same `match /databases/{database}/documents` block
match /verifications/{walletAddress} {
  // Allow read by the authenticated user whose walletAddress matches the document ID.
  // This might be too permissive depending on whether clients need to read this directly.
  // Often, status is checked via a backend service/hook which uses admin/privileged access.
  // If `request.auth.uid` is the wallet address:
  allow read: if request.auth != null && request.auth.uid == walletAddress;

  // Allow write (create/update) by an authenticated process.
  // Direct client-side writes to verification status are risky.
  // These operations should ideally be handled by a trusted server-side environment
  // (e.g., Cloud Function triggered after Firebase Phone Auth completion or via VerificationService if it runs server-side).
  // If VerificationService runs client-side and updates this directly:
  // - Ensure `request.auth.token.phone_number_verified` is true (requires custom claims).
  // - Validate incoming data rigorously (e.g., `isVerified` can only be set to true by client).
  // - Restrict which fields can be written by the client.
  // Example assuming client-side update by a phone-verified user:
  allow write: if request.auth != null &&
                  request.auth.uid == walletAddress && // User can only write to their own verification doc
                  request.auth.token.phone_number_verified == true; // Firebase Auth custom claim

  // It's often safer for the backend (VerificationService running with admin/trusted context,
  // or a Cloud Function) to handle writes to prevent tampering.
}
```
**Note on Security Rules:** These are conceptual rules. The exact implementation depends on how authentication tokens are structured (e.g., if `walletAddress` or a user ID is available in `request.auth.uid` or `request.auth.token` as a custom claim after your primary authentication) and the trust model for client-side updates. For sensitive operations like verification, server-side validation and writes are generally preferred.

### Data Validation in Rules
-   Enforce data types, required fields, and valid formats (e.g., wallet addresses) within security rules where possible.
-   Example: `request.resource.data.isVerified is bool`

### Privacy Considerations
-   User data should be isolated (e.g., users can only access their own data).
-   Apply the principle of least privilege.

## Usage Examples (Illustrative for `FirestoreService`)

### Creating a New User
```typescript
// Assuming firestoreService is an instance of FirestoreService
try {
  const newUser = await firestoreService.createUser({
    wallet: "USER_WALLET_ADDRESS_HERE",
    // Initialize other fields as per FirestoreUser definition,
    // excluding id, createdAt, updatedAt
    smsVerified: false, // Example initial value
    lastSmsVerification: new Date(0), // Example initial value
    hasProjectTokens: false, // Example initial value
  });
  console.log("User created:", newUser);
} catch (error) {
  // Handle error (e.g., if error is instance of FirestoreError)
  console.error(`Failed to create user:`, error);
}
```

### Updating User Verification (via `FirestoreService`)
```typescript
// Note: This method's usage should be reviewed due to data overlap concerns.
try {
  await firestoreService.updateUserVerification(
    "USER_WALLET_ADDRESS_HERE",
    true
  );
  console.log("User verification updated in 'users' collection.");
} catch (error) {
  console.error(`Failed to update user verification:`, error);
}
```

## Best Practices & Future Considerations
Refer to the general best practices for performance, data consistency, monitoring, scalability, and feature extensions as they apply to any Firestore implementation. The key consideration highlighted in this document is the need to resolve the data overlap between the `users` and `verifications` collections concerning phone verification status.