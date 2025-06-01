// docs/architecture/state-management.md
# State Management

## Overview
The XTNCT NinjaAI ICO DApp uses Zustand for state management. This lightweight state management solution was chosen for its simplicity, TypeScript support, and optimal performance characteristics.

## State Structure

### User State

interface UserState {
  wallet: string | null;
  isConnected: boolean;
  isSmsVerified: boolean;
  hasProjectTokens: boolean;
}

### Balance State

interface BalanceState {
  balances: TokenBalance[];
  lastUpdated: Date | null;
}

### Price State

interface PriceState {
  prices: TokenPrice[];
  lastFetched: Date | null;
}

## Usage Examples

### Accessing State

import { useAppStore } from '@/system/store';

// In your component
const { wallet, isConnected } = useAppStore(state => state.user);
const { balances } = useAppStore(state => state.balance);

### Updating State

const updateWallet = useAppStore(state => state.updateWallet);
updateWallet('new-wallet-address');

## State Update Patterns

### Atomic Updates

* Each state update should be atomic
* Avoid updating multiple slices simultaneously
* Use dedicated actions for complex state changes

### Error Handling

* State includes global error handling
* Services should update error state appropriately
* UI components can react to error states

## Performance Considerations

### Selective Re-rendering

* Use selective state subscription
* Avoid unnecessary re-renders
* Implement proper memoization where needed

### State Persistence

* Critical state is backed by localStorage
* Implements automatic state rehydration
* Handles persistence errors gracefully
