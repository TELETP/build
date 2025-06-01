// src/system/config/utils.ts

export class ConfigurationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'ConfigurationError';
    }
  }
  
  export const validateAddress = (address: string, label: string): string => {
    if (!address) {
      throw new ConfigurationError(`${label} is not configured`);
    }
    // Basic Solana address validation (base58, 32-44 characters)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      throw new ConfigurationError(`${label} is not a valid Solana address format`);
    }
    return address;
  };
  
  export const validateApiKey = (key: string, service: string): string => {
    if (!key) {
      throw new ConfigurationError(`${service} API key is not configured`);
    }
    return key;
  };
  