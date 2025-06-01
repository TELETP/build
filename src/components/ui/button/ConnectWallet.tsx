// src/components/ui/button/ConnectWallet.tsx
'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { ConnectWalletProps } from './types';

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

  const handleClick = async () => {
    try {
      if (connected) {
        await disconnect();
        onDisconnect?.();
      } else {
        await connect();
        onConnect?.();
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  return (
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
  );
}
