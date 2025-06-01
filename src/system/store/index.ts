// src/system/store/index.ts
import { create } from 'zustand';
import { AppState } from './types';

export const useAppStore = create<AppState>((set) => ({
  user: {
    wallet: null,
    isConnected: false,
    isSmsVerified: false,
    hasProjectTokens: false,
  },
  balance: {
    balances: [],
    lastUpdated: null,
  },
  prices: {
    prices: [],
    lastFetched: null,
  },
  isLoading: false,
  error: null,
}));
