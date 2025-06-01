// src/components/ui/display/ProjectTokenPrice.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import { ErrorMessage } from '../feedback/ErrorMessage';
import { tokenPriceService, DetailedProjectTokenPrice, TokenPriceError } from '@/system/services/token/service';

export function ProjectTokenPrice() {
  const [priceData, setPriceData] = useState<DetailedProjectTokenPrice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);

  const fetchPrice = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tokenPriceService.getProjectTokenPrice();
      setPriceData(prevData => {
        // Check for stage transition
        if (prevData && data.stageTransition.from) {
          setShowTransition(true);
          setTimeout(() => setShowTransition(false), 5000); // Hide after 5 seconds
        }
        return data;
      });
    } catch (err) {
      if (err instanceof TokenPriceError) {
        setError(`${err.message} (${err.code})`);
      } else {
        setError('Failed to calculate token price');
      }
      console.error('Price calculation error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchPrice]);

  if (isLoading && !priceData) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={fetchPrice} />;
  if (!priceData) return null;

  const formatTimeUntilNext = (ms: number): string => {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <div className="space-y-4">
      {/* Stage Transition Alert */}
      {showTransition && priceData.stageTransition.from && (
        <div className="bg-blue-50 text-blue-700 p-2 rounded-lg mb-2 animate-fade-in">
          Sale stage changed from {priceData.stageTransition.from.name} to {priceData.currentStage.name}
        </div>
      )}

      {/* Current Stage */}
      <div className="space-y-2">
        <div className="font-medium">{priceData.currentStage.name}</div>
        <div className="text-lg">
          {priceData.priceInSOL} SOL (${priceData.priceInUSD.toFixed(2)})
        </div>
      </div>

      {/* Price Changes */}
      {priceData.priceChange && (
        <div className="text-sm space-y-1">
          {priceData.priceChange.fromPrevious !== 0 && (
            <div className={priceData.priceChange.fromPrevious > 0 ? 'text-green-600' : 'text-red-600'}>
              {priceData.priceChange.fromPrevious > 0 ? '+' : ''}
              {priceData.priceChange.fromPrevious.toFixed(1)}% from previous stage
            </div>
          )}
          {priceData.priceChange.toNext !== 0 && (
            <div className="text-gray-600">
              +{priceData.priceChange.toNext.toFixed(1)}% in next stage
            </div>
          )}
        </div>
      )}

      {/* Next Stage Info */}
      {priceData.stageTransition.timeUntilNext && (
        <div className="text-sm text-gray-500">
          Next stage in {formatTimeUntilNext(priceData.stageTransition.timeUntilNext)}
        </div>
      )}

      {/* Token Limits */}
      {priceData.currentStage.maxTokens && (
        <div className="text-sm text-gray-500">
          Max tokens: {priceData.currentStage.maxTokens.toLocaleString()}
        </div>
      )}
    </div>
  );
}
