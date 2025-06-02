// src/system/services/balance/types.ts
export interface TokenBalance {
  symbol: string;
  amount: number;
  usdValue: number;
  mintAddress?: string;
  decimals?: number;
}

export interface BalanceErrorDetails {
  originalError?: unknown;
  walletAddress?: string;
  tokenAddress?: string;
  context?: {
    [key: string]: string | number | boolean;
  };
}

export class BalanceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: BalanceErrorDetails
  ) {
    super(message);
    this.name = 'BalanceError';
  }
}
