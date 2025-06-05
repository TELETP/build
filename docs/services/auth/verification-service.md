# Phone Verification Service (`VerificationService`)

This document describes the `VerificationService` located in `src/system/services/auth/verification.ts`. This service is responsible for managing the phone number verification logic using Firebase Phone Authentication and interacting with Firestore to store verification statuses.

## Overview

The `VerificationService` encapsulates all operations related to:

*   Sending OTP (One-Time Password) verification codes to users' phone numbers.
*   Verifying the OTP codes entered by users.
*   Updating and retrieving verification statuses from Firestore.
*   Managing verification attempts and cooldown periods.
*   Providing specific behavior for development/testing environments.

## Key Methods and Properties

### `constructor()`
*   Initializes `TEST_NUMBERS` (a `Set` of predefined phone numbers for development) and `TEST_CODE` (a static string for development OTP).
*   Sets `MAX_ATTEMPTS` (e.g., 3) and `COOLDOWN_MINUTES` (e.g., 15).

### `async sendVerificationCode(phoneNumber: string, recaptchaVerifier: ApplicationVerifier): Promise<string>`
*   **Purpose:** Sends an OTP to the given `phoneNumber`.
*   **Parameters:**
    *   `phoneNumber`: The user's phone number.
    *   `recaptchaVerifier`: A Firebase `ApplicationVerifier` instance (typically reCAPTCHA) required by Firebase to prevent abuse.
*   **Returns:** A `Promise` that resolves to a `verificationId` string from Firebase if successful.
*   **Development Mode:** If `process.env.NODE_ENV === 'development'` and the `phoneNumber` is in `TEST_NUMBERS`, it simulates SMS sending, logs a message, and returns a test verification ID (`'test-verification-id'`).
*   **Error Handling:** Throws a `VerificationError` with code `SEND_CODE_ERROR` on failure.

### `async verifyCode(verificationId: string, code: string, wallet: string): Promise<boolean>`
*   **Purpose:** Verifies the OTP `code` provided by the user against the `verificationId`.
*   **Parameters:**
    *   `verificationId`: The ID received from `sendVerificationCode`.
    *   `code`: The OTP code entered by the user.
    *   `wallet`: The user's wallet address, used to update their verification status in Firestore.
*   **Returns:** A `Promise` that resolves to `true` if the code is valid.
*   **Development Mode:** If `process.env.NODE_ENV === 'development'`, `verificationId` is `'test-verification-id'`, and `code` matches `TEST_CODE`, it considers the verification successful and updates the status.
*   **Actions on Success:** If verification is successful (either in dev mode or via Firebase), it calls `this.updateVerificationStatus(wallet, true)`.
*   **Error Handling:** Throws a `VerificationError` with code `INVALID_CODE` if Firebase deems the code invalid.

### `async updateVerificationStatus(wallet: string, isVerified: boolean): Promise<void>`
*   **Purpose:** Updates the verification status for a given `wallet` address in Firestore.
*   **Parameters:**
    *   `wallet`: The wallet address.
    *   `isVerified`: Boolean indicating the new verification status.
*   **Firestore Interaction:** Updates the document at `verifications/{wallet}` in Firestore with fields:
    *   `isVerified`
    *   `lastVerified`: Current timestamp if `isVerified` is true, else `null`.
    *   `updatedAt`: Current timestamp.
*   **Error Handling:** Throws a `VerificationError` with code `UPDATE_STATUS_ERROR` on failure.

### `async getVerificationStatus(wallet: string): Promise<VerificationStatus>`
*   **Purpose:** Retrieves the verification status for a given `wallet` address from Firestore.
*   **Parameters:**
    *   `wallet`: The wallet address.
*   **Returns:** A `Promise` that resolves to a `VerificationStatus` object (interface defined in the same file):
    ```typescript
    export interface VerificationStatus {
      isVerified: boolean;
      lastVerified: Date | null;
      attempts: number;
      cooldown?: Date; // Timestamp until which the user is in a cooldown period
    }
    ```
    If no document exists, it returns a default status object with `isVerified: false`, `lastVerified: null`, and `attempts: 0`.
*   **Error Handling:** Throws a `VerificationError` with code `GET_STATUS_ERROR` on failure.

### `async incrementAttempts(wallet: string): Promise<void>`
*   **Purpose:** Increments the verification attempt counter for a `wallet`. If attempts reach `MAX_ATTEMPTS`, it sets a cooldown period.
*   **Parameters:**
    *   `wallet`: The wallet address.
*   **Firestore Interaction:**
    *   First, calls `this.getVerificationStatus(wallet)` to get the current attempts.
    *   Updates the document at `verifications/{wallet}` with the new `attempts` count.
    *   If `attempts >= MAX_ATTEMPTS`, it also sets a `cooldown` timestamp (current time + `COOLDOWN_MINUTES`).
*   **Error Handling:** Throws a `VerificationError` with code `INCREMENT_ATTEMPTS_ERROR` on failure.

### `isTestNumber(phoneNumber: string): boolean`
*   **Purpose:** Utility method to check if a given `phoneNumber` is one of the predefined test numbers for development mode.
*   **Returns:** `true` if it's a test number in development, `false` otherwise.

## Custom Error Type: `VerificationError`

The service defines and uses a custom error class `VerificationError`:

```typescript
export class VerificationError extends Error {
  constructor(
    message: string,
    public code: string, // e.g., 'SEND_CODE_ERROR', 'INVALID_CODE'
    public details?: any // Optional additional details
  ) {
    super(message);
    this.name = 'VerificationError';
  }
}
```
This allows UI components to catch specific error types and display more targeted messages to the user by inspecting the `error.code`.

## Dependencies

*   Firebase SDK (Auth for phone verification).
*   `firestoreService` (`src/system/services/firestore/index.ts`): For interacting with the Firestore database.

## Development Mode Behavior Summary

*   **Test Phone Numbers & Code:** Allows bypassing actual SMS verification using predefined test numbers and a single test OTP.
*   **Simulated SMS:** `sendVerificationCode` does not actually trigger an SMS for test numbers.
*   This is controlled by `process.env.NODE_ENV === 'development'` and the `isTestNumber` method.

This service is crucial for the dApp's user verification mechanism, providing a secure and controlled way to manage phone-based authentication.
