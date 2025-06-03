// src/components/ui/button/ConnectWallet.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useState } from 'react';
import { ConnectWalletProps } from './types';
import { ErrorMessage } from '../feedback/ErrorMessage';

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
    disconnect 
  } = useWallet();

  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setError(null);
    try {
      if (connected) {
        await disconnect();
        onDisconnect?.();
      } else {
        if (!wallet) {
          setError(
            'No wallet found. Please install a Solana wallet like Phantom, Solflare, or Backpack.'
          );
          return;
        }
        await connect();
        onConnect?.();
      }
    } catch (error) {
      if (error instanceof WalletNotConnectedError) {
        setError(
          'No wallet found. Please install a Solana wallet like Phantom, Solflare, or Backpack.'
        );
      } else {
        setError('Failed to connect wallet. Please try again.');
        console.error('Wallet connection error:', error);
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
              !wallet ? {
                label: 'Get a Wallet',
                onClick: () => window.open('https://solana.com/ecosystem/wallets', '_blank')
              } : undefined
            }
          />
        </div>
      )}
    </div>
  );
}
