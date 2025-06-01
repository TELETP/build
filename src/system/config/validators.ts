// src/system/config/validators.ts

import { 
    SolanaConfig, 
    SolanaTokenAddresses, 
    ValidationResult, 
    ConfigurationError,
    DevConfig 
  } from './types';
  import { DEFAULT_DEVNET_ADDRESSES } from './env';
  
  // Validate Solana address format
  export const isValidSolanaAddress = (address: string): boolean => {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  };
  
  // Validate RPC endpoint URL
  export const isValidRPCEndpoint = (endpoint: string): boolean => {
    try {
      new URL(endpoint);
      return true;
    } catch {
      return false;
    }
  };
  
  // Validate token addresses
  export const validateTokenAddresses = (
    addresses: Partial<SolanaTokenAddresses>,
    isDevelopment: boolean
  ): ValidationResult => {
    const errors: string[] = [];
    const requiredTokens = ['USDT', 'USDC', 'SOL', 'PROJECT_TOKEN'] as const;
  
    for (const token of requiredTokens) {
      const address = addresses[token];
      if (!address) {
        if (isDevelopment) {
          // Use default address in development
          addresses[token] = DEFAULT_DEVNET_ADDRESSES[token];
        } else {
          errors.push(`Missing ${token} address`);
        }
      } else if (!isValidSolanaAddress(address)) {
        errors.push(`Invalid ${token} address format`);
      }
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // Validate complete Solana configuration
  export const validateSolanaConfig = (
    config: Partial<SolanaConfig>,
    devConfig?: DevConfig
  ): ValidationResult => {
    const errors: string[] = [];
    const isDevelopment = devConfig?.isDevelopment || process.env.NODE_ENV === 'development';
  
    // Validate RPC endpoint
    if (!config.RPC_ENDPOINT) {
      errors.push('Missing RPC endpoint');
    } else if (!isValidRPCEndpoint(config.RPC_ENDPOINT)) {
      errors.push('Invalid RPC endpoint URL format');
    }
  
    // Validate network
    if (!config.NETWORK) {
      errors.push('Missing network configuration');
    } else if (!['devnet', 'testnet', 'mainnet-beta'].includes(config.NETWORK)) {
      errors.push('Invalid network value');
    }
  
    // Validate program ID
    if (!config.PROGRAM_ID) {
      if (isDevelopment) {
        config.PROGRAM_ID = DEFAULT_DEVNET_ADDRESSES.PROGRAM_ID;
      } else {
        errors.push('Missing program ID');
      }
    } else if (!isValidSolanaAddress(config.PROGRAM_ID)) {
      errors.push('Invalid program ID format');
    }
  
    // Validate token addresses
    const tokenValidation = validateTokenAddresses(
      config.TOKEN_ADDRESSES || {},
      isDevelopment
    );
    errors.push(...tokenValidation.errors);
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // Validate development configuration
  export const validateDevConfig = (config: Partial<DevConfig>): ValidationResult => {
    const errors: string[] = [];
  
    if (config.placeholders) {
      if (config.placeholders.PROGRAM_ID && !isValidSolanaAddress(config.placeholders.PROGRAM_ID)) {
        errors.push('Invalid placeholder program ID format');
      }
      if (config.placeholders.PROJECT_TOKEN && !isValidSolanaAddress(config.placeholders.PROJECT_TOKEN)) {
        errors.push('Invalid placeholder project token format');
      }
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // Helper function to throw formatted configuration errors
  export const throwConfigError = (
    message: string,
    field?: string,
    value?: string
  ): never => {
    throw new ConfigurationError(message, {
      code: 'CONFIG_VALIDATION_ERROR',
      field,
      value
    });
  };
  
  // Utility function to ensure required environment variables exist
  export const validateEnvironmentVariables = (
    required: string[],
    isDevelopment: boolean = process.env.NODE_ENV === 'development'
  ): ValidationResult => {
    const errors: string[] = [];
  
    for (const variable of required) {
      if (!process.env[variable] && !isDevelopment) {
        errors.push(`Missing required environment variable: ${variable}`);
      }
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  
  // Function to get safe configuration values with fallbacks
  export const getSafeConfig = <T>(
    getValue: () => T,
    fallback: T,
    isDevelopment: boolean = process.env.NODE_ENV === 'development'
  ): T => {
    try {
      const value = getValue();
      return value || (isDevelopment ? fallback : throwConfigError('Missing required value'));
    } catch (error) {
      if (isDevelopment) {
        console.warn('Using fallback value due to error:', error);
        return fallback;
      }
      throw error;
    }
  };
  