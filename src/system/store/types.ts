// src/system/store/types.ts
import { TokenBalance } from '../services/balance/types';
import { TokenPrice } from '../services/price/types';

export interface UserState {
  wallet: string | null;
  isConnected: boolean;
  isSmsVerified: boolean;
  hasProjectTokens: boolean;
}

export interface BalanceState {
  balances: TokenBalance[];
  lastUpdated: Date | null;
}

export interface PriceState {
  prices: TokenPrice[];
  lastFetched: Date | null;
}

export interface AppState {
  user: UserState;
  balance: BalanceState;
  prices: PriceState;
  isLoading: boolean;
  error: string | null;
}
