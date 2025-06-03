// src/components/ui/button/ConnectWallet/index.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConnectWalletProps } from './types';
import { ErrorMessage } from '../../feedback/ErrorMessage';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SOLANA_CONFIG } from '@/system/config/solana';
import WalletButton from './WalletButton';
import WalletList from './WalletList';

// Import wallet types
import '@/system/types/wallet';

const WALLET_STORAGE_KEY = 'selectedWallet';

interface DetectedWallet {
  name: string;
  installed: boolean;
  iconPath?: string;
}

export default function ConnectWallet({
  className = '',
  isLoading,
  onConnect,
  onDisconnect,
  ...props
}: ConnectWalletProps) {
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(localStorage.getItem(WALLET_STORAGE_KEY));
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWalletList, setShowWalletList] = useState(false);

  const checkWallets = useCallback(() => {
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
  }, []);

  useEffect(() => {
    checkWallets();
    window.addEventListener('load', checkWallets);
    return () => window.removeEventListener('load', checkWallets);
  }, [checkWallets]);

  const connectWallet = useCallback(async (walletName: string) => {
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

      if (walletName === 'Phantom' && provider.isConnected && provider?.publicKey) {
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
      } else if (provider && 'connect' in provider){
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
  }, []);

  const disconnectWallet = useCallback(async () => {
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
  }, [selectedWallet]);

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
      <WalletButton
        isConnected={isConnected}
        isLoading={isLoading}
        onClick={handleClick}
        className={className}
        {...props}
      />

      {showWalletList && !isConnected && (
        <WalletList
          wallets={detectedWallets}
          onSelect={(walletName) => {
            setSelectedWallet(walletName);
            connectWallet(walletName);
          }}
        />
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

