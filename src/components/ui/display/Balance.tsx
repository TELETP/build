// src/components/ui/display/Balance.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../feedback/LoadingSpinner';
import { ErrorMessage } from '../feedback/ErrorMessage';
import { BalanceProps } from './types';
import { balanceService } from '@/system/services/balance/service';
import { TokenBalance, BalanceError } from '@/system/services/balance/types';

export function Balance({ 
  className = '',
  showUsdValue = true 
}: BalanceProps) {
  const { publicKey, connected } = useWallet();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) {
      setBalances([]);
      return;
    }

    const fetchBalances = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const walletBalances = await balanceService.getAllBalances(publicKey.toString());
        setBalances(walletBalances);
      } catch (err) {
        if (err instanceof BalanceError) {
          setError(`${err.message} (${err.code})`);
        } else {
          setError('Failed to fetch balances');
        }
        console.error('Balance fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
    // Set up polling for balance updates
    const interval = setInterval(fetchBalances, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [publicKey, connected]);

  if (!connected) {
    return null;
  }

  if (isLoading && balances.length === 0) {
    return <LoadingSpinner className="mx-auto" />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {balances.map(({ symbol, amount, usdValue }) => (
        <div 
          key={symbol}
          className="flex justify-between items-center p-2 rounded-lg bg-gray-50"
        >
          <span className="font-medium">{symbol}</span>
          <div className="text-right">
            <div>{amount.toFixed(symbol === 'SOL' ? 4 : 2)}</div>
            {showUsdValue && (
              <div className="text-sm text-gray-500">
                ${usdValue.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
