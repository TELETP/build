// src/components/ui/button/ConnectWallet.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useState, useEffect } from 'react';
import { ConnectWalletProps } from './types';
import { ErrorMessage } from '../feedback/ErrorMessage';

interface WalletError extends Error {
  name: string;
  message: string;
}

export function ConnectWallet({ 
  className = '',
  isLoading,
  onConnect,
  onDisconnect,
  ...props
}: ConnectWalletProps) {
  const { 
    wallet,
    connecting,
    connected,
    connect,
    disconnect,
    select,
    wallets  // Add this to check available wallets
  } = useWallet();

  const [error, setError] = useState<string | null>(null);
  const [hasAvailableWallets, setHasAvailableWallets] = useState<boolean>(false);

  // Check for available wallets
  useEffect(() => {
    setHasAvailableWallets(wallets.length > 0);
  }, [wallets]);

  const handleClick = async () => {
    setError(null);
    try {
      if (connected) {
        await disconnect();
        onDisconnect?.();
      } else {
        // Only show no wallet error if there are truly no wallets available
        if (!hasAvailableWallets) {
          setError(
            'Please install a Solana wallet (Phantom, Solflare, or Backpack)'
          );
          return;
        }
        
        // If wallets are available but none selected, show select message
        if (!wallet) {
          setError('Please select a wallet to connect');
          return;
        }

        await connect();
        onConnect?.();
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      const walletError = error as WalletError;
      
      // More specific error handling
      switch (walletError.name) {
        case 'WalletNotSelectedError':
          setError('Please select a wallet to connect');
          break;
        case 'WalletNotConnectedError':
          setError('Wallet not connected. Please try again.');
          break;
        case 'WalletConnectionError':
          setError('Failed to connect to wallet. Please try again.');
          break;
        default:
          setError(walletError.message || 'Failed to connect wallet. Please try again.');
      }
    }
  };

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleClick}
        disabled={isLoading || connecting}
        className={`
          px-4 py-2 rounded-lg
          ${connected 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
          }
          text-white font-medium
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors
          ${className}
        `}
        {...props}
      >
        {isLoading || connecting ? (
          'Connecting...'
        ) : connected ? (
          `Disconnect ${wallet?.adapter.name || ''}`
        ) : (
          'Connect Wallet'
        )}
      </button>
      
      {error && (
        <div className="w-64">
          <ErrorMessage 
            message={error}
            action={
              !hasAvailableWallets ? {
                label: 'Get a Wallet',
                onClick: () => window.open('https://solana.com/solana-wallets', '_blank')
              } : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
