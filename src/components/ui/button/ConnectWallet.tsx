// src/components/ui/button/ConnectWallet.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ConnectWalletProps } from './types';
import { ErrorMessage } from '../feedback/ErrorMessage';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SOLANA_CONFIG } from '@/system/config/solana';

// Import wallet types
import '@/system/types/wallet';

const WALLET_STORAGE_KEY = 'selectedWallet';

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

      const storedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
      if (storedWallet && wallets.some(w => w.name === storedWallet)) {
        setSelectedWallet(storedWallet);
        connectWallet(storedWallet).catch(() => {
          localStorage.removeItem(WALLET_STORAGE_KEY);
          setSelectedWallet(null);
        });
      } else if (wallets.length === 1) {
        setSelectedWallet(wallets[0].name);
      }
    };

    checkWallets();
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

      if (walletName === 'Phantom' && provider.isConnected && provider.publicKey) {
        const network = SOLANA_CONFIG.NETWORK as WalletAdapterNetwork;
        if (provider.network !== network) {
          try {
            await provider.disconnect();
            await provider.connect({ onlyIfTrusted: true, network });
          } catch (networkError) {
            console.error('Failed to switch networks:', networkError);
            setError('Failed to switch to correct network. Please connect manually.');
            return;
          }
        }
      } else {
        await provider.connect();
      }

      localStorage.setItem(WALLET_STORAGE_KEY, walletName);
      setIsConnected(true);
      setError(null);
      onConnect?.();
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      if (err.message === 'User rejected the request.') {
        setError('Please approve the connection in your wallet.');
      } else {
        setError(err.message || 'Failed to connect wallet. Please try again.');
      }
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

        localStorage.removeItem(WALLET_STORAGE_KEY);
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
