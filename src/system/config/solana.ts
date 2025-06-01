// src/system/config/solana.ts
import { clusterApiUrl } from '@solana/web3.js';
import { SolanaConfig } from './types';
import { ConfigurationError, validateAddress } from './utils';

const validateSolanaConfig = (): SolanaConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  try {
    return {
      RPC_ENDPOINT: process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || clusterApiUrl('devnet'),
      NETWORK: 'devnet',
      PROGRAM_ID: isDevelopment 
        ? '11111111111111111111111111111111'
        : validateAddress(process.env.NEXT_PUBLIC_PROGRAM_ID || '', 'Program ID'),
      TOKEN_ADDRESSES: {
        USDT: validateAddress(process.env.NEXT_PUBLIC_USDT_SOLANA_DEVNET_MINT_ADDRESS || '', 'USDT mint address'),
        USDC: validateAddress(process.env.NEXT_PUBLIC_USDC_SOLANA_DEVNET_MINT_ADDRESS || '', 'USDC mint address'),
        SOL: validateAddress(process.env.NEXT_PUBLIC_SOL_SOLANA_DEVNET_MINT_ADDRESS || '', 'SOL mint address'),
        PROJECT_TOKEN: isDevelopment
          ? '11111111111111111111111111111111'
          : validateAddress(process.env.NEXT_PUBLIC_PROJECT_TOKEN_MINT_ADDRESS || '', 'Project token mint address'),
      }
    };
  } catch (error) {
    if (isDevelopment) {
      return {
        RPC_ENDPOINT: clusterApiUrl('devnet'),
        NETWORK: 'devnet',
        PROGRAM_ID: '11111111111111111111111111111111',
        TOKEN_ADDRESSES: {
          USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
          USDC: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
          SOL: 'So11111111111111111111111111111111111111112',
          PROJECT_TOKEN: '11111111111111111111111111111111'
        }
      };
    }
    throw new ConfigurationError(
      `Solana configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

// Export the config
export const SOLANA_CONFIG = validateSolanaConfig();
