// src/system/config/validators.test.ts

import { 
    isValidSolanaAddress,
    isValidRPCEndpoint,
    validateTokenAddresses,
    validateSolanaConfig,
    validateDevConfig 
  } from './validators';
  import { DEFAULT_DEVNET_ADDRESSES } from './env';
  
  // Example test cases (you can expand these)
  describe('Solana Configuration Validators', () => {
    describe('isValidSolanaAddress', () => {
      it('should validate correct Solana addresses', () => {
        expect(isValidSolanaAddress(DEFAULT_DEVNET_ADDRESSES.SOL)).toBe(true);
      });
  
      it('should reject invalid addresses', () => {
        expect(isValidSolanaAddress('invalid')).toBe(false);
      });
    });
  
    describe('isValidRPCEndpoint', () => {
      it('should validate correct URLs', () => {
        expect(isValidRPCEndpoint('https://api.devnet.solana.com')).toBe(true);
      });
  
      it('should reject invalid URLs', () => {
        expect(isValidRPCEndpoint('not-a-url')).toBe(false);
      });
    });
  });
  