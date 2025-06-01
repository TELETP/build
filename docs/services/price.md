# Price Service

## Overview
The Price Service manages real-time price data for tokens used in the ICO DApp. It handles price fetching, caching, and USD value calculations using the CoinMarketCap API.

## Core Functionality

### Price Types
```typescript
interface TokenPrice {
  symbol: string;
  usdPrice: number;
  lastUpdated: Date;
  source: 'coinmarketcap' | 'cache' | 'fallback';
}

interface PriceCache {
  [symbol: string]: {
    price: number;
    timestamp: Date;
  };
}

interface PriceServiceConfig {
  cacheTimeout: number;  // milliseconds
  maxRetries: number;
  apiRateLimit: number;  // calls per minute
}
```

### Service Class
```typescript
class PriceService {
  private readonly cache: PriceCache;
  private readonly config: PriceServiceConfig;
  private readonly apiKey: string;

  constructor(
    apiKey: string,
    config: Partial<PriceServiceConfig> = {}
  ) {
    this.apiKey = apiKey;
    this.cache = {};
    this.config = {
      cacheTimeout: 15 * 60 * 1000, // 15 minutes
      maxRetries: 3,
      apiRateLimit: 30,
      ...config
    };
  }

  async getPrice(symbol: string): Promise<TokenPrice>;
  async getPrices(symbols: string[]): Promise<TokenPrice[]>;
  async refreshCache(): Promise<void>;
}
```

## Implementation Details

### Price Fetching
```typescript
private async fetchPriceFromAPI(symbol: string): Promise<number> {
  const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest`;
  const response = await fetch(url, {
    headers: {
      'X-CMC_PRO_API_KEY': this.apiKey,
      'Accept': 'application/json'
    },
    params: {
      symbol: symbol,
      convert: 'USD'
    }
  });

  if (!response.ok) {
    throw new PriceServiceError(
      'Failed to fetch price',
      'API_ERROR',
      response.statusText
    );
  }

  const data = await response.json();
  return data.data[symbol].quote.USD.price;
}
```

### Caching Mechanism
```typescript
private getCachedPrice(symbol: string): TokenPrice | null {
  const cached = this.cache[symbol];
  if (!cached) return null;

  const age = Date.now() - cached.timestamp.getTime();
  if (age > this.config.cacheTimeout) {
    delete this.cache[symbol];
    return null;
  }

  return {
    symbol,
    usdPrice: cached.price,
    lastUpdated: cached.timestamp,
    source: 'cache'
  };
}
```

### Error Handling
```typescript
class PriceServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'PriceServiceError';
  }
}
```

## Usage Examples

### Basic Price Fetch
```typescript
const priceService = new PriceService(process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY);

try {
  const solPrice = await priceService.getPrice('SOL');
  console.log(`Current SOL price: $${solPrice.usdPrice}`);
} catch (error) {
  if (error instanceof PriceServiceError) {
    console.error(`Price fetch failed: ${error.message}`);
  }
}
```

### Batch Price Update
```typescript
async function updateAllPrices() {
  const tokens = ['SOL', 'USDT', 'USDC'];
  try {
    const prices = await priceService.getPrices(tokens);
    prices.forEach(price => {
      console.log(`${price.symbol}: $${price.usdPrice}`);
    });
  } catch (error) {
    console.error('Failed to update prices:', error);
  }
}
```

## Rate Limiting

### Implementation
```typescript
class RateLimiter {
  private requests: number = 0;
  private readonly resetInterval: number;
  private readonly maxRequests: number;

  constructor(maxRequests: number, resetInterval: number = 60000) {
    this.maxRequests = maxRequests;
    this.resetInterval = resetInterval;
    setInterval(() => this.reset(), resetInterval);
  }

  async acquire(): Promise<boolean> {
    if (this.requests >= this.maxRequests) {
      return false;
    }
    this.requests++;
    return true;
  }

  private reset(): void {
    this.requests = 0;
  }
}
```

## Performance Optimization

### Caching Strategy
1. **In-Memory Cache**
   - Primary cache layer
   - Fast access
   - Memory-efficient storage
2. **Persistent Cache**
   - LocalStorage backup
   - Survives page reloads
   - Configurable retention

### Batch Operations
- Groups multiple price requests
- Reduces API calls
- Optimizes rate limit usage

## Error Recovery

### Retry Strategy
```typescript
private async withRetry<T>(
  operation: () => Promise<T>,
  retries: number = this.config.maxRetries
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && this.isRetryableError(error)) {
      await this.delay(Math.pow(2, this.config.maxRetries - retries) * 1000);
      return this.withRetry(operation, retries - 1);
    }
    throw error;
  }
}
```

### Fallback Mechanism
1. Try API call
2. Check cache
3. Use fallback price
4. Report error

## Integration Points

### Balance Service
- Provides prices for balance calculations
- Shares cache mechanism
- Coordinates updates

### State Management
- Updates global price state
- Triggers UI updates
- Maintains price history

## Monitoring

### Health Checks
```typescript
async checkHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'error';
  latency: number;
  cacheSize: number;
  lastUpdate: Date;
}> {
  // Implementation
}
```

### Metrics
- API call success rate
- Cache hit ratio
- Average response time
- Error frequency

## Future Considerations

### Scalability
- Support for more price sources
- WebSocket price updates
- Distributed caching

### Feature Extensions
- Price alerts
- Historical data
- Custom update intervals

### Security Enhancements
- API key rotation
- Request signing
- Rate limit per client