// src/system/services/price/types.ts
export interface CoinMarketCapResponse {
  data: {
    SOL: {
      quote: {
        USD: {
          price: number;
          percent_change_24h: number;
          last_updated: string;
        };
      };
    };
  };
  status: {
    timestamp: string;
    error_code: number;
    error_message: string | null;
  };
}

export interface CoinGeckoResponse {
  solana: {
    usd: number;
    usd_24h_change: number;
    last_updated_at: number;
  };
}

export type PriceSource = 
  | 'CoinMarketCap' 
  | 'CoinGecko' 
  | 'Development Mock' 
  | 'Development Mock (CoinGecko Fallback)';

export interface SolanaPrice {
  price: number;
  change24h: number;
  lastUpdated: Date;
  source: PriceSource;
}

export interface PriceServiceError extends Error {
  code?: string;
  status?: number;
  isRateLimit?: boolean;
  retryAfter?: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;  // milliseconds
  maxDelay: number;   // milliseconds
}
