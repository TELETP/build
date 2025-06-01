// src/system/config/env.ts

declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NEXT_PUBLIC_SOLANA_RPC_ENDPOINT?: string;
        NEXT_PUBLIC_PROGRAM_ID?: string;  // Changed from FUNDING_ADDRESS
        NEXT_PUBLIC_USDT_SOLANA_DEVNET_MINT_ADDRESS?: string;
        NEXT_PUBLIC_USDC_SOLANA_DEVNET_MINT_ADDRESS?: string;
        NEXT_PUBLIC_SOL_SOLANA_DEVNET_MINT_ADDRESS?: string;
        NEXT_PUBLIC_PROJECT_TOKEN_MINT_ADDRESS?: string;
        NEXT_PUBLIC_COINMARKETCAP_API_KEY?: string;
        NEXT_PUBLIC_CIRCLE_LASTMAN?: string;
        NODE_ENV: 'development' | 'production' | 'test';
      }
    }
  }
  
  // Export configuration constants
  export const DEFAULT_DEVNET_ADDRESSES = {
    PROGRAM_ID: '11111111111111111111111111111111',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    USDC: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
    SOL: 'So11111111111111111111111111111111111111112',
    PROJECT_TOKEN: '11111111111111111111111111111111'
  } as const;
  
  // Ensure this file is treated as a module
  export {};
  