# External API Integrations

This document describes the external APIs integrated into the dApp, how they are configured, and important considerations for their usage.

## Overview

The dApp is configured to connect to the following external APIs:

*   **CoinMarketCap API:** Used for fetching cryptocurrency market data, such as token prices.
*   **Circle API:** Configured in the system, but its specific usage is not currently active in the codebase.

These integrations are managed via environment variables and initialized in `src/system/config/external.ts`.

## Configuration

API keys for external services are managed through environment variables. The `src/system/config/external.ts` file reads these variables and makes them available through the `EXTERNAL_APIS` object.

Key environment variables:

*   `NEXT_PUBLIC_COINMARKETCAP_API_KEY`: The API key for accessing CoinMarketCap services.
*   `NEXT_PUBLIC_CIRCLE_LASTMAN`: The API key for accessing Circle services.

The system includes validation checks (`src/system/config/utils.ts` and `external.ts`) to ensure these keys are present during application startup, using placeholder values for development mode if actual keys are not provided. For a comprehensive list of all project environment variables and their general security considerations, please refer to the [Environment Variables documentation](../configuration/environment-variables.md).

## API Details

### 1. CoinMarketCap API

*   **Purpose:** To fetch real-time or historical cryptocurrency market data, primarily token prices.
*   **Configuration:** `EXTERNAL_APIS.COINMARKETCAP` provides the configured API key.
*   **Usage:** The `PriceService` (`src/system/services/price/service.ts`) utilizes this API key to query CoinMarketCap.
*   **Client-Side Exposure:** The `NEXT_PUBLIC_` prefix means this API key is accessible in the client-side bundle. This is generally acceptable for many CoinMarketCap API tiers, which are often designed for public data access.

### 2. Circle API

*   **Purpose:** The intended purpose for integrating Circle API is not evident from its current usage in the codebase. Circle provides a range of financial services, including payments, stablecoin (USDC) infrastructure, and digital asset management.
*   **Configuration:** `EXTERNAL_APIS.CIRCLE` provides the configured API key.
*   **Usage:**
    *   **Currently, there is no active operational code in the reviewed services and components that directly utilizes `EXTERNAL_APIS.CIRCLE` to make requests or perform actions with the Circle API.**
    *   The configuration exists and is validated at startup. This might indicate a planned future feature or a deprecated integration.
*   **Client-Side Exposure & Security (Important):**
    *   The API key is configured using `NEXT_PUBLIC_CIRCLE_LASTMAN`, making it accessible in the client-side JavaScript bundle.
    *   **Security Risk:** If this API key is a **secret key** that grants sensitive permissions (e.g., payment processing, account management), its exposure on the client-side is a **critical security risk**. Such keys should *never* be directly embedded in client-side code.
    *   **Recommendation:**
        1.  **Verify Sensitivity:** Determine if the `NEXT_PUBLIC_CIRCLE_LASTMAN` key is a public key (intended for client-side use, rare for Circle) or a secret key.
        2.  **If Secret:**
            *   It should be renamed (e.g., to `CIRCLE_API_KEY` without the `NEXT_PUBLIC_` prefix).
            *   It must **only** be used server-side. This involves creating a backend proxy (e.g., a Next.js API route) that the client application calls. This backend route would then securely use the API key to interact with Circle. This approach is also discussed in the [Environment Variables documentation](../configuration/environment-variables.md) under security considerations.
        3.  **If Unused and Potentially Sensitive:** Even if unused, exposing a potentially sensitive key is risky. Consider removing the configuration entirely if there are no immediate plans for its use, or implement it server-side when the feature is developed.
        4.  **If Public and Unused:** While less risky, having unused configurations can lead to confusion. Consider removing it until it's actively needed.

## Best Practices for API Keys

*   **Principle of Least Privilege:** API keys should only have the minimum permissions necessary for their intended function.
*   **Server-Side for Sensitive Keys:** Any API key that performs mutating operations, accesses private data, or incurs significant costs should be kept on the server-side and never exposed to the client.
*   **Rotation:** Regularly rotate API keys according to the service provider's recommendations.
*   **Monitoring:** Monitor API usage for any suspicious activity.

By following these guidelines and carefully managing API key exposure, the dApp can maintain a secure and robust integration with external services.
