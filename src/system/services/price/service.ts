// src/system/services/price/service.ts
import { EXTERNAL_APIS } from '@/system/config/external';
import { 
  CoinMarketCapResponse, 
  CoinGeckoResponse,
  SolanaPrice, 
  PriceServiceError,
  RetryConfig 
} from './types';

class PriceService {
  private readonly CMC_BASE_URL = 'https://pro-api.coinmarketcap.com/v2';
  private readonly COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
  private readonly CACHE_DURATION = 60000; // 1 minute in milliseconds
  private readonly RETRY_CONFIG: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,  // 1 second
    maxDelay: 10000   // 10 seconds
  };

  private cache: {
    solana?: {
      data: SolanaPrice;
      timestamp: number;
    };
    rateLimitReset?: number;
  } = {};

  private calculateBackoff(attempt: number, config: RetryConfig): number {
    // Exponential backoff with jitter
    const exponentialDelay = Math.min(
      config.maxDelay,
      config.baseDelay * Math.pow(2, attempt)
    );
    // Add random jitter (±20%)
    const jitter = exponentialDelay * 0.2 * (Math.random() * 2 - 1);
    return exponentialDelay + jitter;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleRateLimit(response: Response): void {
    const resetTime = response.headers.get('X-RateLimit-Reset');
    if (resetTime) {
      this.cache.rateLimitReset = parseInt(resetTime) * 1000; // Convert to milliseconds
    } else {
      // If no reset time provided, default to 5 minutes
      this.cache.rateLimitReset = Date.now() + (5 * 60 * 1000);
    }
  }

  private isRateLimited(): boolean {
    return Boolean(
      this.cache.rateLimitReset && 
      Date.now() < this.cache.rateLimitReset
    );
  }

  private getMockPrice(): SolanaPrice {
    // Generate slightly different mock data each time
    const basePrice = 100;
    const randomChange = (Math.random() * 10) - 5; // Random number between -5 and 5
    
    return {
      price: basePrice + (Math.random() * 10) - 5,
      change24h: randomChange,
      lastUpdated: new Date(),
      source: 'Development Mock'
    };
  }

  private async fetchFromCoinMarketCap(): Promise<SolanaPrice> {
    // Return mock data in development mode
    if (process.env.NODE_ENV === 'development') {
      return this.getMockPrice();
    }

    // Check rate limit
    if (this.isRateLimited()) {
      const error = new Error('Rate limit exceeded') as PriceServiceError;
      error.code = 'RATE_LIMIT';
      error.isRateLimit = true;
      error.retryAfter = this.cache.rateLimitReset 
        ? Math.ceil((this.cache.rateLimitReset - Date.now()) / 1000)
        : undefined;
      throw error;
    }

    const response = await fetch(
      `${this.CMC_BASE_URL}/cryptocurrency/quotes/latest?symbol=SOL`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': EXTERNAL_APIS.COINMARKETCAP,
          'Accept': 'application/json'
        }
      }
    );

    if (response.status === 429) {
      this.handleRateLimit(response);
      const error = new Error('Rate limit exceeded') as PriceServiceError;
      error.code = 'RATE_LIMIT';
      error.status = 429;
      error.isRateLimit = true;
      throw error;
    }

    if (!response.ok) {
      const error = new Error('Failed to fetch from CoinMarketCap') as PriceServiceError;
      error.status = response.status;
      error.code = 'CMC_API_ERROR';
      throw error;
    }

    const data: CoinMarketCapResponse = await response.json();

    if (data.status.error_code !== 0) {
      const error = new Error(data.status.error_message || 'CMC API Error') as PriceServiceError;
      error.code = 'CMC_API_ERROR';
      throw error;
    }

    const solData = data.data.SOL;
    return {
      price: solData.quote.USD.price,
      change24h: solData.quote.USD.percent_change_24h,
      lastUpdated: new Date(solData.quote.USD.last_updated),
      source: 'CoinMarketCap'
    };
  }

  private async fetchFromCoinGecko(): Promise<SolanaPrice> {
    // Return mock data in development mode
    if (process.env.NODE_ENV === 'development') {
      const mockData = this.getMockPrice();
      mockData.source = 'Development Mock (CoinGecko Fallback)';
      return mockData;
    }

    const response = await fetch(
      `${this.COINGECKO_BASE_URL}/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`
    );

    if (!response.ok) {
      const error = new Error('Failed to fetch from CoinGecko') as PriceServiceError;
      error.status = response.status;
      error.code = 'COINGECKO_API_ERROR';
      throw error;
    }

    const data: CoinGeckoResponse = await response.json();
    
    return {
      price: data.solana.usd,
      change24h: data.solana.usd_24h_change,
      lastUpdated: new Date(data.solana.last_updated_at * 1000),
      source: 'CoinGecko'
    };
  }

  private async fetchWithFallback(attempt: number = 0): Promise<SolanaPrice> {
    try {
      // Try CoinMarketCap first
      return await this.fetchFromCoinMarketCap();
    } catch (cmcError) {
      console.warn('CoinMarketCap fetch failed:', cmcError);
      
      try {
        // Fallback to CoinGecko
        console.log('Falling back to CoinGecko...');
        return await this.fetchFromCoinGecko();
      } catch (geckoError) {
        console.error('CoinGecko fallback failed:', geckoError);
        
        // If we haven't exceeded retry attempts, try again
        if (attempt < this.RETRY_CONFIG.maxRetries) {
          const delay = this.calculateBackoff(attempt, this.RETRY_CONFIG);
          console.warn(`Retry attempt ${attempt + 1} after ${delay}ms`);
          await this.delay(delay);
          return this.fetchWithFallback(attempt + 1);
        }

        // If all retries failed and we're in development, return mock data
        if (process.env.NODE_ENV === 'development') {
          console.warn('All attempts failed in development mode, using mock data');
          return this.getMockPrice();
        }

        // In production, throw the original CMC error
        throw cmcError;
      }
    }
  }

  private isCacheValid(): boolean {
    if (!this.cache.solana) return false;
    return (Date.now() - this.cache.solana.timestamp) < this.CACHE_DURATION;
  }

  async getSolanaPrice(): Promise<SolanaPrice> {
    // Check cache first
    if (this.isCacheValid() && this.cache.solana) {
      return this.cache.solana.data;
    }

    // Fetch fresh data with fallback
    const data = await this.fetchWithFallback();
    
    // Update cache
    this.cache.solana = {
      data,
      timestamp: Date.now()
    };

    return data;
  }

  clearCache(): void {
    this.cache = {};
  }
}

export const priceService = new PriceService();
