// src/components/ui/button/ConnectWallet.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ConnectWalletProps } from './types';
import { ErrorMessage } from '../feedback/ErrorMessage';

// Import wallet types
import '@/system/types/wallets';

interface DetectedWallet {
  name: string;
  installed: boolean;
  iconPath?: string;
}

export function ConnectWallet({
  className = '',
  isLoading,
  onConnect,
  onDisconnect,
  ...props
}: ConnectWalletProps) {
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletList, setShowWalletList] = useState(false);

  useEffect(() => {
    const checkWallets = () => {
      const wallets: DetectedWallet[] = [];

      if (window.phantom?.solana?.isPhantom) {
        wallets.push({ name: 'Phantom', installed: true, iconPath: '/phantom-icon.png' });
      }

      if (window.solflare?.isSolflare) {
        wallets.push({ name: 'Solflare', installed: true, iconPath: '/solflare-icon.png' });
      }

      setDetectedWallets(wallets);
      if (wallets.length === 1) {
        setSelectedWallet(wallets[0].name);
      }
    };

    checkWallets();
    // Add event listener for wallet installations
    window.addEventListener('load', checkWallets);
    return () => window.removeEventListener('load', checkWallets);
  }, []);

  const connectWallet = async (walletName: string) => {
    try {
      let provider;

      switch (walletName) {
        case 'Phantom':
          provider = window.phantom?.solana;
          break;
        case 'Solflare':
          provider = window.solflare;
          break;
        default:
          throw new Error('Unsupported wallet');
      }

      if (!provider) {
        throw new Error('Wallet not found');
      }

      await provider.connect();
      setIsConnected(true);
      setError(null);
      onConnect?.();
    } catch (err) {
      console.error('Wallet connection error:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const disconnectWallet = async () => {
    try {
      if (selectedWallet) {
        let provider;
        switch (selectedWallet) {
          case 'Phantom':
            provider = window.phantom?.solana;
            break;
          case 'Solflare':
            provider = window.solflare;
            break;
        }

        if (provider) {
          await provider.disconnect();
        }

        setIsConnected(false);
        setSelectedWallet(null);
        onDisconnect?.();
      }
    } catch (err) {
      console.error('Wallet disconnect error:', err);
      setError('Failed to disconnect wallet');
    }
  };


  const handleClick = () => {
    if (isConnected) {
      disconnectWallet();
    } else if (detectedWallets.length === 0) {
      setError('Please install a Solana wallet (Phantom or Solflare)');
    } else if (detectedWallets.length === 1 && selectedWallet) {
      connectWallet(selectedWallet);
    } else {
      setShowWalletList(!showWalletList);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`
          px-4 py-2 rounded-lg
          ${isConnected
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
        {isLoading ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect Wallet'}
      </button>

      {showWalletList && !isConnected && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
          {detectedWallets.map((wallet) => (
            <button
              key={wallet.name}
              onClick={() => {
                setSelectedWallet(wallet.name);
                setShowWalletList(false);
                connectWallet(wallet.name);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
            >
              {wallet.iconPath && (
                <Image src={wallet.iconPath} alt={wallet.name} width={20} height={20} />
              )}
              <span>{wallet.name}</span>
            </button>
          ))}
        </div>
      )}

      {error && (
        <div className="absolute right-0 mt-2 w-64">
          <ErrorMessage
            message={error}
            action={
              detectedWallets.length === 0 ? {
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
