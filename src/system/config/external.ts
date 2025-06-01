// src/system/config/external.ts
import { ExternalAPIs } from './types';
import { ConfigurationError, validateApiKey } from './utils';

const validateExternalConfig = (): ExternalAPIs => {
  // In development, use placeholder values
  if (process.env.NODE_ENV === 'development') {
    return {
      COINMARKETCAP: process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY || 'development',
      CIRCLE: process.env.NEXT_PUBLIC_CIRCLE_LASTMAN || 'development'
    };
  }

  try {
    const config: ExternalAPIs = {
      COINMARKETCAP: validateApiKey(
        process.env.NEXT_PUBLIC_COINMARKETCAP_API_KEY || '',
        'CoinMarketCap'
      ),
      CIRCLE: validateApiKey(
        process.env.NEXT_PUBLIC_CIRCLE_LASTMAN || '',
        'Circle'
      ),
    };

    return config;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using development API keys:', error);
      return {
        COINMARKETCAP: 'development',
        CIRCLE: 'development'
      };
    }
    throw new ConfigurationError(
      `External API configuration error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
};

export const EXTERNAL_APIS = validateExternalConfig();
