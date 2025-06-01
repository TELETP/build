// src/system/config/index.ts

import { ConfigurationError } from './utils';  // Make sure to import the error type

export * from './types';
export { SOLANA_CONFIG } from './solana';
export { EXTERNAL_APIS } from './external';
export { ConfigurationError } from './utils';

// Initialize and validate all configurations
try {
  // Access configs to trigger validation
  const { SOLANA_CONFIG, EXTERNAL_APIS } = require('./');
  console.log('Configuration validated successfully');
} catch (error: unknown) {  // Explicitly type the error
  if (error instanceof ConfigurationError) {
    console.error('Configuration Error:', error.message);
  } else {
    // Handle unknown error type safely
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Unexpected error during configuration:', errorMessage);
  }
  // In production, you might want to prevent the app from starting
  if (process.env.NODE_ENV === 'production') {
    throw error;
  }
}
