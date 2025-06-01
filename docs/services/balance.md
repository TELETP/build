# Balance Service

## Overview
The Balance Service manages token balance monitoring and validation for the ICO DApp. It handles balance checks across multiple tokens (SOL, USDT, USDC) and ensures users meet minimum balance requirements.

## Core Functionality

### Balance Types
```typescript
interface TokenBalance {
  symbol: string;
  amount: number;
  usdValue: number;
  lastUpdated: Date;
}

interface BalanceCheck {
  meetsMinSol: boolean;
  meetsTotalMinimum: boolean;
  balances: TokenBalance[];
  totalUsdValue: number;
}

interface BalanceThresholds {
  minSolUsd: number;
  minTotalUsd: number;
}
```

### Service Class
```typescript
class BalanceService {
  private readonly priceService: PriceService;
  private readonly thresholds: BalanceThresholds;

  constructor(
    priceService: PriceService,
    thresholds: BalanceThresholds = {
      minSolUsd: 1.0,
      minTotalUsd: 5.0
    }
  ) {
    this.priceService = priceService;
    this.thresholds = thresholds;
  }

  async checkBalances(wallet: string): Promise<BalanceCheck>;
  async getTokenBalance(wallet: string, token: string): Promise<TokenBalance>;
  async validateRequirements(wallet: string): Promise<boolean>;
}
```

## Implementation Details

### Balance Checking

#### Token Balance Retrieval
```typescript
async getTokenBalance(wallet: string, token: string): Promise<TokenBalance> {
  // Fetch raw balance from Solana
  // Get current price from price service
  // Calculate USD value
  // Return formatted balance
}
```

#### Requirements Validation
```typescript
async validateRequirements(wallet: string): Promise<boolean> {
  const check = await this.checkBalances(wallet);
  return check.meetsMinSol && check.meetsTotalMinimum;
}
```

### Error Handling
```typescript
class BalanceServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BalanceServiceError';
  }
}
```

## Usage Examples

### Basic Balance Check
```typescript
const balanceService = new BalanceService(priceService);

try {
  const balanceCheck = await balanceService.checkBalances(walletAddress);
  
  if (balanceCheck.meetsMinSol) {
    console.log('Meets minimum SOL requirement');
    console.log(`Total USD value: $${balanceCheck.totalUsdValue}`);
  }
} catch (error) {
  if (error instanceof BalanceServiceError) {
    console.error(`Balance check failed: ${error.message}`);
  }
}
```

### Continuous Monitoring
```typescript
class BalanceMonitor {
  private readonly balanceService: BalanceService;
  private readonly updateInterval: number;
  private timerId?: NodeJS.Timeout;

  constructor(
    balanceService: BalanceService,
    updateInterval: number = 60000 // 1 minute
  ) {
    this.balanceService = balanceService;
    this.updateInterval = updateInterval;
  }

  startMonitoring(wallet: string, callback: (check: BalanceCheck) => void) {
    this.timerId = setInterval(async () => {
      try {
        const check = await this.balanceService.checkBalances(wallet);
        callback(check);
      } catch (error) {
        console.error('Balance monitoring error:', error);
      }
    }, this.updateInterval);
  }

  stopMonitoring() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}
```

## Integration Points

### Price Service Integration
- Relies on PriceService for current token prices
- Caches price data to minimize API calls
- Handles price update failures gracefully

### Wallet Integration
- Connects to Solana wallet adapter
- Handles wallet connection states
- Manages multiple token accounts

### State Management
- Updates global balance state
- Triggers UI updates
- Maintains balance history

## Performance Considerations

### Caching Strategy

#### Balance Caching
- Cache duration: 30 seconds
- Invalidation on transactions
- Separate cache per token

#### Price Caching
- Shared price cache with PriceService
- Updates every 15 minutes
- Fallback to last known price

### Rate Limiting
- Implements request throttling
- Batches multiple balance checks
- Prevents API abuse

### Error Recovery

#### Network Issues
- Retry logic for failed requests
- Exponential backoff
- Fallback to cached data

#### Invalid States
- Handles missing token accounts
- Validates balance data
- Provides meaningful error messages

## Future Considerations

### Scalability
- Support for additional tokens
- Dynamic threshold updates
- Performance optimization

### Feature Extensions
- Balance change notifications
- Historical balance tracking
- Custom monitoring intervals

### Security Enhancements
- Rate limiting per wallet
- Suspicious activity detection
- Enhanced error reporting