// src/components/ui/display/TokenPrice.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import { ErrorMessage } from '../feedback/ErrorMessage';
import { priceService } from '@/system/services/price/service';
import { SolanaPrice, PriceServiceError } from '@/system/services/price/types';

export function TokenPrice() {
  const [priceData, setPriceData] = useState<SolanaPrice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);

  const fetchPrice = useCallback(async () => {
    if (retryAfter && Date.now() < retryAfter) {
      return; // Skip fetch if we're still rate limited
    }

    setIsLoading(true);
    setError(null);
    setRetryAfter(null);

    try {
      const data = await priceService.getSolanaPrice();
      setPriceData(data);
    } catch (err) {
      const error = err as PriceServiceError;
      if (error.isRateLimit && error.retryAfter) {
        setError('Rate limit exceeded');
        setRetryAfter(Date.now() + (error.retryAfter * 1000));
      } else {
        setError('Failed to fetch SOL price');
      }
      console.error('Price fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [retryAfter]);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchPrice]);

  if (isLoading && !priceData) return <LoadingSpinner />;
  
  if (error) {
    return (
      <ErrorMessage 
        message={
          retryAfter 
            ? `${error}. Retrying in ${Math.ceil((retryAfter - Date.now()) / 1000)}s`
            : error
        }
        onRetry={retryAfter ? undefined : fetchPrice}
      />
    );
  }

  if (!priceData) return null;

  return (
    <div className="flex items-center space-x-4">
      <span>${priceData.price.toFixed(2)}</span>
      <span className={priceData.change24h >= 0 ? 'text-green-600' : 'text-red-600'}>
        {priceData.change24h >= 0 ? '+' : ''}
        {priceData.change24h.toFixed(2)}%
      </span>
      <span className="text-xs text-gray-400">
        via {priceData.source}
      </span>
    </div>
  );
}
