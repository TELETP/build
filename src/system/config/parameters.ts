// src/system/config/parameters.ts
import { ConfigurationError } from './utils';

export interface DAppParameters {
  BALANCE_REQUIREMENTS: {
    MIN_SOL_USD: number;
    MIN_TOTAL_USD: number;
  };
  TIMEOUTS: {
    PRICE_CACHE_MINUTES: number;
    SMS_VERIFICATION_DAYS: number;
  };
  API_LIMITS: {
    MAX_PRICE_CALLS_PER_MINUTE: number;
  };
}

const validateParameters = (params: DAppParameters): DAppParameters => {
  // Validate balance requirements
  if (params.BALANCE_REQUIREMENTS.MIN_SOL_USD <= 0) {
    throw new ConfigurationError('Minimum SOL USD value must be positive');
  }
  if (params.BALANCE_REQUIREMENTS.MIN_TOTAL_USD <= params.BALANCE_REQUIREMENTS.MIN_SOL_USD) {
    throw new ConfigurationError('Minimum total USD must be greater than minimum SOL USD');
  }

  // Validate timeouts
  if (params.TIMEOUTS.PRICE_CACHE_MINUTES <= 0 || params.TIMEOUTS.PRICE_CACHE_MINUTES > 60) {
    throw new ConfigurationError('Price cache timeout must be between 1 and 60 minutes');
  }
  if (params.TIMEOUTS.SMS_VERIFICATION_DAYS <= 0 || params.TIMEOUTS.SMS_VERIFICATION_DAYS > 365) {
    throw new ConfigurationError('SMS verification timeout must be between 1 and 365 days');
  }

  // Validate API limits
  if (params.API_LIMITS.MAX_PRICE_CALLS_PER_MINUTE <= 0) {
    throw new ConfigurationError('API rate limit must be positive');
  }

  return params;
};

const DEFAULT_PARAMETERS: DAppParameters = {
  BALANCE_REQUIREMENTS: {
    MIN_SOL_USD: 1.0,
    MIN_TOTAL_USD: 5.0,
  },
  TIMEOUTS: {
    PRICE_CACHE_MINUTES: 15,
    SMS_VERIFICATION_DAYS: 90,
  },
  API_LIMITS: {
    MAX_PRICE_CALLS_PER_MINUTE: 30,
  },
};

export const DAPP_PARAMETERS = validateParameters(DEFAULT_PARAMETERS);
