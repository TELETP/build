# Environment Variables

## Overview
This document lists all environment variables required for the dApp. These variables are typically defined in a `.env.local` file (which should not be committed to version control) or set in the deployment environment.

## Variables Listing

### Solana Configuration
These variables are primarily consumed by `src/system/config/solana.ts`.

*   `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT`
    *   **Description:** URL of the Solana RPC endpoint to connect to.
    *   **Example:** `https://api.devnet.solana.com`
    *   **Note:** Defaults to Solana Devnet cluster if not set.
*   `NEXT_PUBLIC_PROGRAM_ID`
    *   **Description:** The on-chain address of the dApp's Solana program.
    *   **Example:** `YourDAppProgramIdAddressHere`
    *   **Note:** A default placeholder is used in development mode if not set.
*   `NEXT_PUBLIC_USDT_SOLANA_DEVNET_MINT_ADDRESS`
    *   **Description:** Mint address for the USDT token on the configured Solana network (typically Devnet for this specific variable name).
    *   **Example:** `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`
*   `NEXT_PUBLIC_USDC_SOLANA_DEVNET_MINT_ADDRESS`
    *   **Description:** Mint address for the USDC token on the configured Solana network.
    *   **Example:** `4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU`
*   `NEXT_PUBLIC_SOL_SOLANA_DEVNET_MINT_ADDRESS`
    *   **Description:** Mint address for Wrapped SOL on the configured Solana network. While SOL is native, this typically refers to its SPL token representation.
    *   **Example:** `So11111111111111111111111111111111111111112`
*   `NEXT_PUBLIC_PROJECT_TOKEN_MINT_ADDRESS`
    *   **Description:** Mint address for the dApp's specific project token.
    *   **Example:** `YourProjectTokenMintAddressHere`
    *   **Note:** A default placeholder is used in development mode if not set.

### Firebase Configuration
These variables are consumed by `src/system/config/firebase.ts` for initializing the Firebase SDK.

*   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   **Description:** Firebase project API Key.
    *   **Example:** `AIzaSyabcdefghijklmnopqrstuvwxyz123456`
*   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   **Description:** Firebase project authentication domain.
    *   **Example:** `your-project-id.firebaseapp.com`
*   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   **Description:** Firebase project ID.
    *   **Example:** `your-project-id`
*   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   **Description:** Firebase project storage bucket.
    *   **Example:** `your-project-id.appspot.com`
*   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   **Description:** Firebase project messaging sender ID.
    *   **Example:** `123456789012`
*   `NEXT_PUBLIC_FIREBASE_APP_ID`
    *   **Description:** Firebase project application ID.
    *   **Example:** `1:123456789012:web:abcdef1234567890abcdef`

### External API Configuration
These variables are consumed by `src/system/config/external.ts`.

*   `NEXT_PUBLIC_COINMARKETCAP_API_KEY`
    *   **Description:** API key for accessing CoinMarketCap services.
    *   **Example:** `your-coinmarketcap-api-key-here`
*   `NEXT_PUBLIC_CIRCLE_LASTMAN`
    *   **Description:** API key for accessing Circle services.
    *   **Example:** `your-circle-api-key-here`
    *   **Warning:** See Security Considerations regarding client-side exposure of this key.

## Configuration Files
These environment variables are primarily consumed by the following configuration files:
-   `src/system/config/solana.ts`
-   `src/system/config/firebase.ts`
-   `src/system/config/external.ts`

## Security Considerations

*   **Never commit `.env.local` or files containing sensitive keys to version control.** Use a `.gitignore` entry for `.env*.local`.
*   **Client-Side Exposure (`NEXT_PUBLIC_` prefix):** Variables prefixed with `NEXT_PUBLIC_` are embedded into the client-side JavaScript bundle.
    *   Firebase configuration variables (API key, project ID, etc.) are generally safe for client exposure as they are identifiers, not secret credentials for server-side admin access.
    *   For other services like CoinMarketCap, public API keys might be acceptable.
    *   **`NEXT_PUBLIC_CIRCLE_LASTMAN` Warning:** As detailed in `docs/architecture/external-api-integrations.md`, the Circle API key (`NEXT_PUBLIC_CIRCLE_LASTMAN`) is exposed client-side. If this is a sensitive/secret key, it poses a significant security risk. It is also currently not actively used in the codebase. **It is strongly recommended to verify its sensitivity. If sensitive, it should be moved to server-side handling or removed if unused.**
*   **Principle of Least Privilege:** Ensure API keys only have the minimum necessary permissions.
*   **Rotation:** Regularly rotate API keys as per service provider recommendations.
*   **Environment-Specific Keys:** Use different API keys and configurations for development, staging, and production environments to isolate them.

## Development vs. Production Environments

It is crucial to manage configurations separately for different environments:

*   **Firebase:** Consider using separate Firebase projects for development/testing and production to avoid mixing data and configurations.
*   **API Keys:** Use distinct API keys for external services (CoinMarketCap, Circle) in development and production. Development keys might point to sandbox environments or have stricter rate limits/quotas.
*   **Solana Network:** Ensure `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT` and any related addresses (like mint addresses, program IDs) point to the correct Solana network (e.g., Devnet, Testnet, Mainnet-beta) for each environment.
*   **`.env` files:** Use `.env.development.local` and `.env.production.local` if needed, or manage environment variables through your deployment platform's settings for production.