# Solana Configuration

## Overview
This document details the Solana-specific configurations for the dApp, as defined in `src/system/config/solana.ts`. It also includes general best practices and conceptual examples for Solana development relevant to the project.

## Project Solana Configuration (`src/system/config/solana.ts`)

The core Solana configuration for the dApp is managed within `src/system/config/solana.ts`. This file exports a `SOLANA_CONFIG` object, which is initialized by the `validateSolanaConfig` function. This function ensures that all necessary Solana-related environment variables are present and valid, throwing a `ConfigurationError` if issues are found (except in development mode where defaults are often used).

The `SOLANA_CONFIG` object has the following structure:

*   **`RPC_ENDPOINT`**:
    *   **Source:** Determined by the `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT` environment variable.
    *   **Default (if env var not set):** `clusterApiUrl('devnet')` from `@solana/web3.js`, which points to the official Solana Devnet RPC.
    *   **Purpose:** Specifies the Solana RPC node the application will communicate with for all on-chain interactions.

*   **`NETWORK`**:
    *   **Value:** Currently hardcoded to `'devnet'` within `src/system/config/solana.ts`.
    *   **Purpose:** Indicates the Solana network the dApp is configured to operate against.
    *   **Note:** While the `NETWORK` property is static, the actual RPC endpoint and on-chain addresses (Program ID, Token Mints) can be configured via environment variables to point to different effective networks (e.g., a testnet RPC with testnet addresses, or mainnet-beta). However, the `NETWORK` string itself in the config object remains 'devnet'. For a true multi-network setup (e.g., Mainnet, Testnet, Devnet selectable at runtime or build time), this logic would need to be more dynamic.

*   **`PROGRAM_ID`**:
    *   **Source:** Determined by the `NEXT_PUBLIC_PROGRAM_ID` environment variable. This value is validated to ensure it's a valid Solana address.
    *   **Development Default:** A placeholder address (`'11111111111111111111111111111111'`) is used if `process.env.NODE_ENV === 'development'` and the environment variable is not set.
    *   **Purpose:** The on-chain address of the dApp's primary Solana program.

*   **`TOKEN_ADDRESSES`**: An object containing the mint addresses for various SPL tokens used by the dApp. These are also sourced from environment variables and validated.
    *   **`USDT`**:
        *   **Source:** `NEXT_PUBLIC_USDT_SOLANA_DEVNET_MINT_ADDRESS`
    *   **`USDC`**:
        *   **Source:** `NEXT_PUBLIC_USDC_SOLANA_DEVNET_MINT_ADDRESS`
    *   **`SOL`**: (Typically refers to Wrapped SOL as an SPL token)
        *   **Source:** `NEXT_PUBLIC_SOL_SOLANA_DEVNET_MINT_ADDRESS`
    *   **`PROJECT_TOKEN`**:
        *   **Source:** `NEXT_PUBLIC_PROJECT_TOKEN_MINT_ADDRESS`
        *   **Development Default:** A placeholder address is used if `process.env.NODE_ENV === 'development'` and the environment variable is not set.

## Environment Variables
The following environment variables are used by `src/system/config/solana.ts` to configure the `SOLANA_CONFIG` object. Refer to `docs/configuration/environment-variables.md` for a comprehensive list of all project environment variables.

*   `NEXT_PUBLIC_SOLANA_RPC_ENDPOINT`
*   `NEXT_PUBLIC_PROGRAM_ID`
*   `NEXT_PUBLIC_USDT_SOLANA_DEVNET_MINT_ADDRESS`
*   `NEXT_PUBLIC_USDC_SOLANA_DEVNET_MINT_ADDRESS`
*   `NEXT_PUBLIC_SOL_SOLANA_DEVNET_MINT_ADDRESS`
*   `NEXT_PUBLIC_PROJECT_TOKEN_MINT_ADDRESS`

## Wallet Integration

### Supported Wallets
The dApp typically supports a range of Solana wallets compatible with the `@solana/wallet-adapter-react` library, including:
- Phantom
- Solflare
- Backpack
- Other Solana wallet adapters as configured.

### Wallet Configuration
The Solana wallet adapter and providers are typically initialized and managed within a React context provider, such as `src/components/providers/WalletProvider.tsx`. This setup often involves:
```typescript
// Conceptual example from a typical WalletProvider.tsx
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';
import { SOLANA_CONFIG } from '@/system/config'; // Assuming SOLANA_CONFIG.RPC_ENDPOINT is used

// ...
const network = WalletAdapterNetwork.Devnet; // This might be derived or fixed
const endpoint = useMemo(() => SOLANA_CONFIG.RPC_ENDPOINT, []); // Using configured endpoint
const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [network]);
// ...
```
This ensures that wallet interactions use the same RPC endpoint and network context as the rest of the application.

## General Solana Development Best Practices & Concepts
The following sections provide valuable conceptual examples and best practices for Solana development. While not all of these may be fully implemented in the current project, they serve as useful guidelines and considerations for building robust Solana dApps.

### Balance Requirements
(This section seems to be from a previous version or a different context, as `BALANCE_REQUIREMENTS` is not defined in the current `src/system/config/solana.ts`. It's retained here as a general concept.)
Consider defining minimum balance requirements for user wallets to interact with certain dApp features. This can be in SOL (for transaction fees) or specific tokens.
#### Conceptual Example:
```typescript
// Conceptual example, not from src/system/config/solana.ts
export const BALANCE_REQUIREMENTS = {
  MIN_SOL_FOR_TX: 0.001, // Minimum SOL for covering transaction fees
  MIN_PROJECT_TOKEN_FOR_STAKING: 100, // Minimum project tokens to participate in staking
};
```

### Connection Management
Efficiently managing the `Connection` object from `@solana/web3.js` is crucial.
#### Conceptual Example: Connection Instance
```typescript
import { Connection } from '@solana/web3.js';
import { SOLANA_CONFIG } from '@/system/config'; // Actual project config

const connection = new Connection(
  SOLANA_CONFIG.RPC_ENDPOINT,
  'confirmed' // Default commitment level
);
```

### Error Handling
Robust error handling for Solana interactions is important. Custom error classes can be useful.
#### Conceptual Example: Custom Error
```typescript
// Conceptual Example
class SolanaDAppError extends Error {
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'SolanaDAppError';
  }
}
```

### Transaction Settings
Define default transaction options for consistency.
#### Conceptual Example: Default Options
```typescript
// Conceptual Example
const DEFAULT_TRANSACTION_OPTIONS = {
  maxRetries: 3,
  skipPreflight: false, // Usually false for better UX, true for specific high-throughput scenarios
  preflightCommitment: 'confirmed', // Or 'processed' for faster preflight
  commitment: 'confirmed', // Final confirmation level
  timeout: 30000 // 30 seconds
};
```

### Security Considerations

#### RPC Endpoint Security
-   **Use Secure Endpoints:** Prefer HTTPS endpoints. For private RPC nodes, ensure proper authentication and authorization.
-   **Rate Limiting:** Be aware of rate limits on public RPCs. For high-volume dApps, consider private RPCs or services like TritonRPC.
-   **Monitoring:** Monitor RPC requests for suspicious activity if running your own node.

#### Transaction Safety
-   **Client-Side Validation:** Validate inputs before constructing transactions.
-   **Server-Side Validation (if applicable):** If transactions are built or signed off-chain by a backend, ensure rigorous validation there.
-   **Idempotency:** Design transactions to be idempotent where possible, especially for critical operations.
-   **Error Handling:** Implement comprehensive error handling for transaction submission and confirmation.
-   **Transaction Logs:** Maintain logs of significant transactions for auditing and debugging.

### Performance Optimization

#### Connection Pooling (Conceptual)
For backend services or high-traffic scenarios, connection pooling might be considered, though client-side applications usually reuse a single `Connection` instance.
```typescript
// Conceptual example for a backend scenario
const getConnection = (() => {
  let connectionInstance: Connection | null = null;
  return () => {
    if (!connectionInstance) {
      connectionInstance = new Connection(SOLANA_CONFIG.RPC_ENDPOINT, 'confirmed');
    }
    return connectionInstance;
  };
})();
```

#### Caching Strategies
-   **Account Info:** Cache frequently accessed, slowly changing account data (e.g., token account info, program state) using appropriate cache invalidation.
-   **Token Balances:** Can be cached but require careful invalidation strategies due to their dynamic nature.
-   **Market Data:** Prices or other market data should be cached with clear TTLs.

### Testing Configuration

#### Test Networks
1.  **Devnet:** Primary for development and testing against a shared network with free SOL.
2.  **Testnet:** For testing against a more stable environment that aims to mirror mainnet behavior.
3.  **Local Validator (Solana Test Validator):** For isolated testing, rapid development, and deploying programs locally.

#### Test Accounts
-   Use distinct wallets for testing, separate from personal or production wallets.
-   Utilize Solana's airdrop functionality on Devnet/Testnet for test SOL.
-   Document test account setups and initial states.

### Monitoring

#### Health Checks (Conceptual)
Implement checks to ensure the Solana RPC endpoint is reachable and the network is healthy.
```typescript
// Conceptual Example
async function checkSolanaNetworkStatus(connection: Connection): Promise<boolean> {
  try {
    const blockHeight = await connection.getBlockHeight();
    return blockHeight > 0;
  } catch (error) {
    console.error('Solana connection check failed:', error);
    return false;
  }
}
```

#### Performance Metrics
-   Track RPC request latency.
-   Monitor transaction submission and confirmation times.
-   Log transaction success and failure rates.

### Error Recovery

#### Retry Logic (Conceptual)
Implement retry mechanisms for transient network errors or RPC issues when sending transactions.
```typescript
// Conceptual Example
async function sendTransactionWithRetry<T>(
  signedTransaction: Buffer, // Assuming a versioned transaction
  connection: Connection,
  maxRetries: number = 3
): Promise<string> { // Returns transaction signature
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const signature = await connection.sendRawTransaction(signedTransaction, { skipPreflight: true });
      // Add logic to confirm transaction here if needed
      return signature;
    } catch (error) {
      lastError = error;
      // Implement exponential backoff or similar delay strategy
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw lastError;
}
```

### Future Considerations

#### Mainnet Migration
-   Thoroughly test all functionalities on Testnet.
-   Update RPC endpoints to Mainnet-beta.
-   Adjust performance parameters and fee configurations.
-   Implement comprehensive monitoring and alerting for Mainnet.
-   Ensure all on-chain addresses (Program IDs, Token Mints) are correctly set for Mainnet.

#### Scalability
-   Optimize on-chain programs for compute unit efficiency.
-   Design client-side logic to handle potential RPC congestion.
-   Consider off-chain computation for intensive tasks where feasible.

This document provides a snapshot of the dApp's Solana configuration and general best practices. For the most current and detailed configuration, always refer to the `src/system/config/solana.ts` file.