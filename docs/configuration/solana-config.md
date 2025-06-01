# Solana Configuration

## Overview
This document details the Solana-specific configurations required for the XTNCT NinjaAI ICO DApp. The system is configured to operate on Solana's devnet for development and testing purposes.

## Network Configuration

### Devnet Settings
```typescript
export const SOLANA_CONFIG = {
  NETWORK: 'devnet',
  ENDPOINT: 'https://api.devnet.solana.com',
  COMMITMENT: 'confirmed'
};
```

### Token Addresses
```typescript
export const TOKEN_ADDRESSES = {
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  USDC: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  SOL: 'So11111111111111111111111111111111111111112'
};
```

### Balance Requirements

#### Minimum Balances
```typescript
export const BALANCE_REQUIREMENTS = {
  MIN_SOL_USD: 1.0,    // Minimum SOL balance in USD
  MIN_TOTAL_USD: 5.0   // Minimum total balance across all tokens in USD
};
```

## Connection Management

### Connection Instance
```typescript
import { Connection, clusterApiUrl } from '@solana/web3.js';

const connection = new Connection(
  clusterApiUrl('devnet'),
  'confirmed'
);
```

## Error Handling
```typescript
class SolanaConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SolanaConnectionError';
  }
}
```

## Wallet Integration

### Supported Wallets
- Phantom
- Solflare
- Backpack
- Other Solana wallet adapters

### Wallet Configuration
```typescript
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);
```

## Transaction Settings

### Default Options
```typescript
const DEFAULT_TRANSACTION_OPTIONS = {
  maxRetries: 3,
  skipPreflight: false,
  preflightCommitment: 'confirmed',
  timeout: 30000 // 30 seconds
};
```

## Environment Variables

### Required Variables
```env
NEXT_PUBLIC_SOLANA_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROJECT_TOKEN_MINT_ADDRESS=your_token_address_here
NEXT_PUBLIC_FUNDING_ADDRESS=your_funding_address_here
```

## Security Considerations

### RPC Endpoint Security
- Use secure RPC endpoints
- Implement rate limiting
- Monitor for suspicious activity

### Transaction Safety
- Validate all transactions
- Implement proper error handling
- Maintain transaction logs

## Performance Optimization

### Connection Pooling
```typescript
const getConnection = (() => {
  let connection: Connection | null = null;
  return () => {
    if (!connection) {
      connection = new Connection(SOLANA_CONFIG.ENDPOINT, SOLANA_CONFIG.COMMITMENT);
    }
    return connection;
  };
})();
```

### Caching Strategy
- Cache account info
- Cache token balances
- Implement proper cache invalidation

## Testing Configuration

### Test Networks
1. Devnet (primary)
2. Testnet (secondary)
3. Local validator (development)

### Test Accounts
- Maintain separate test wallets
- Use airdropped tokens
- Document test account states

## Monitoring

### Health Checks
```typescript
async function checkSolanaConnection(): Promise<boolean> {
  try {
    const connection = getConnection();
    const blockHeight = await connection.getBlockHeight();
    return blockHeight > 0;
  } catch (error) {
    console.error('Solana connection check failed:', error);
    return false;
  }
}
```

### Performance Metrics
- Track RPC latency
- Monitor transaction success rates
- Log connection status

## Error Recovery

### Retry Logic
```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  throw lastError;
}
```

## Future Considerations

### Mainnet Migration
- Update RPC endpoints
- Adjust performance parameters
- Review security settings

### Scalability
- Load balancing strategies
- Connection pooling
- Cache optimization

### Monitoring
- Implementation of metrics
- Alert systems
- Performance tracking