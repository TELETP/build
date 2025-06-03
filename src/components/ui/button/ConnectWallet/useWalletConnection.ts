// src/components/ui/button/ConnectWallet/useWalletConnection.ts
import { useState, useCallback } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SOLANA_CONFIG } from '@/system/config/solana';
import '@/system/types/wallet';

const WALLET_STORAGE_KEY = 'selectedWallet';

interface UseWalletConnectionProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface WalletError extends Error {
  name: string;
  message: string;
}


const useWalletConnection = ({ onConnect, onDisconnect }: UseWalletConnectionProps) => {
  const [selectedWallet, setSelectedWallet] = useState<string | null>(localStorage.getItem(WALLET_STORAGE_KEY));
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (walletName: string) => {
    try {
      setIsConnecting(true);
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
            setIsConnecting(false);
            return;
          }
        }
      } else if (provider && 'connect' in provider) {
        await provider.connect();
      }

      localStorage.setItem(WALLET_STORAGE_KEY, walletName);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      onConnect?.();
    } catch (error: unknown) {
      console.error('Wallet connection error:', error);
      if (error instanceof Error) {
        if (error.message === 'User rejected the request.') {
          setError('Please approve the connection in your wallet.');
        } else {
          setError(error.message || 'Failed to connect wallet. Please try again.');
        }
      } else {
        setError('An unknown error occurred.');
      }
      setIsConnecting(false);
    }
  }, [onConnect]);

  const disconnect = useCallback(async () => {
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
  }, [selectedWallet, onDisconnect]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    error,
    selectedWallet
  };
};

export default useWalletConnection;
