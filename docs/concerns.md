# Development Concerns and Technical Debt

This document lists current concerns, potential issues, and areas of technical debt identified within the codebase that require further attention or future refactoring.

## 1. Client-Exposed and Unused Circle API Key (`NEXT_PUBLIC_CIRCLE_LASTMAN`)

*   **Concern:** The API key `NEXT_PUBLIC_CIRCLE_LASTMAN` is configured for client-side exposure due to the `NEXT_PUBLIC_` prefix. However, an analysis of the codebase indicates that this key and its corresponding `EXTERNAL_APIS.CIRCLE` configuration are not actively used for any operations.

*   **Potential Security Risk:**
    *   If this API key is sensitive (i.e., grants permissions beyond basic public data access, such as payment processing or account management), its presence in the client-side JavaScript bundle poses a security risk. Even if currently unused by the dApp, an exposed sensitive key could potentially be exploited if discovered.
    *   If the key is non-sensitive (e.g., a public, read-only key), the risk is lower, but an unused configuration still adds clutter and potential for future misconfiguration.

*   **Current Status:**
    *   The key is validated at application startup.
    *   No active usage of `EXTERNAL_APIS.CIRCLE` was found in services or components.

*   **Affected Files:**
    *   `src/system/config/external.ts`: Defines and validates `EXTERNAL_APIS.CIRCLE` using the `NEXT_PUBLIC_CIRCLE_LASTMAN` environment variable.
    *   `src/system/config/types.ts`: Contains the type definition `ExternalAPIs` which includes the `CIRCLE` property.
    *   `docs/configuration/environment-variables.md`: Lists `NEXT_PUBLIC_CIRCLE_LASTMAN` as a required environment variable.
    *   `docs/architecture/external-api-integrations.md`: Discusses the Circle API integration and the `NEXT_PUBLIC_CIRCLE_LASTMAN` key.
    *   Example environment files (e.g., `.env.local.example` if it exists and lists this variable).

*   **Recommendations:**
    1.  **Verify Sensitivity & Intended Use:** Determine the exact nature of the `NEXT_PUBLIC_CIRCLE_LASTMAN` API key and its intended purpose for the Circle API.
    2.  **If Sensitive and Planned for Future Use:** When the feature utilizing this key is implemented, the key should be moved to server-side handling. This involves:
        *   Renaming the environment variable (e.g., to `CIRCLE_API_KEY` without the `NEXT_PUBLIC_` prefix).
        *   Creating a backend API route (e.g., in Next.js) that uses this key securely on the server to interact with Circle.
        *   Updating client-side code to call this new backend route.
    3.  **If Non-Sensitive but Unused:** Consider removing the configuration to reduce clutter and avoid potential confusion. It can be re-added when needed.
    4.  **If Sensitive and NOT Planned for Use:** Remove the configuration and environment variable immediately to eliminate the potential security risk.

## 2. Overlap in SMS Verification Status Storage

*   **Concern:** Phone verification status appears to be stored in two places:
    1.  In the `verifications` collection (managed directly by `VerificationService`), which stores detailed status including attempts, cooldowns, and timestamps. This seems to be the primary and most comprehensive source.
    2.  In the `users` collection (managed by `FirestoreService` via the `FirestoreUser` type), which contains `smsVerified` and `lastSmsVerification` fields.

*   **Potential Issue:** Storing the same or similar information in two places can lead to data inconsistency, confusion, and increased complexity in maintaining data integrity.

*   **Affected Files:**
    *   `src/system/services/auth/verification.ts` (manages `verifications` collection)
    *   `src/system/services/firestore/index.ts` (defines `FirestoreService` and `FirestoreUser` type for `users` collection)
    *   `docs/services/firestore.md` (discusses both collections)
    *   `docs/services/auth/verification-service.md`

*   **Recommendations:**
    1.  **Single Source of Truth:** Establish the `verifications` collection as the single, authoritative source for all phone verification-related data.
    2.  **Refactor/Deprecate:**
        *   Consider deprecating the `smsVerified` and `lastSmsVerification` fields from the `FirestoreUser` model in the `users` collection.
        *   If user objects still need to reflect verification status directly, this information should be derived or synchronized from the `verifications` collection when user data is fetched or displayed.
        *   The `FirestoreService.updateUserVerification()` method should be reviewed and potentially refactored or deprecated to ensure all verification status updates go through `VerificationService`.
    3.  **Rationale:** This consolidation will simplify data management, reduce redundancy, and improve overall data integrity.

*(Add other concerns as they are identified)*
