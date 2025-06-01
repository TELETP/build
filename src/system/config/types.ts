// src/system/config/types.ts

export type SolanaNetwork = 'devnet' | 'testnet' | 'mainnet-beta';

export interface SolanaTokenAddresses {
  USDT: string;
  USDC: string;
  SOL: string;
  PROJECT_TOKEN: string;
}

export interface SolanaConfig {
  RPC_ENDPOINT: string;
  NETWORK: SolanaNetwork;
  PROGRAM_ID: string;  // Changed from FUNDING_ADDRESS to PROGRAM_ID
  TOKEN_ADDRESSES: SolanaTokenAddresses;
}

export interface ExternalAPIs {
  COINMARKETCAP: string;
  CIRCLE: string;
}

// Validation related types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ConfigValidator<T> {
  validate: (config: T) => ValidationResult;
}

// Development mode types
export interface DevConfig {
  isDevelopment: boolean;
  placeholders: {
    PROGRAM_ID: string;
    PROJECT_TOKEN: string;
  };
}

// Error types
export interface ConfigurationErrorDetails {
  code: string;
  field?: string;
  value?: string;
}

export class ConfigurationError extends Error {
  details?: ConfigurationErrorDetails;

  constructor(message: string, details?: ConfigurationErrorDetails) {
    super(message);
    this.name = 'ConfigurationError';
    this.details = details;
  }
}
