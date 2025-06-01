// src/system/hooks/useWalletAuth.ts
import { useCallback, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { verificationService } from '../services/auth/verification';
import { verificationStorageService } from '../services/auth/storage';

interface WalletAuthState {
  isConnecting: boolean;
  isVerifying: boolean;
  requiresVerification: boolean;
  isVerified: boolean;
  error: string | null;
}

export function useWalletAuth() {
  const { 
    publicKey,
    connected,
    connecting,
    connect,
    disconnect: disconnectWallet,
    select,
    wallet
  } = useWallet();

  const [state, setState] = useState<WalletAuthState>({
    isConnecting: false,
    isVerifying: false,
    requiresVerification: false,
    isVerified: false,
    error: null
  });

  const checkVerification = useCallback(async (walletAddress: string) => {
    try {
      setState(prev => ({ ...prev, isVerifying: true }));
      
      // Check local storage first
      const localVerification = verificationStorageService.isVerified(walletAddress);
      if (localVerification) {
        setState(prev => ({
          ...prev,
          isVerifying: false,
          requiresVerification: false,
          isVerified: true
        }));
        return;
      }

      // Check Firestore
      const isVerified = await verificationService.isWalletVerified(walletAddress);
      if (isVerified) {
        verificationStorageService.storeVerification(walletAddress);
      }

      setState(prev => ({
        ...prev,
        isVerifying: false,
        requiresVerification: !isVerified,
        isVerified
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isVerifying: false,
        error: 'Failed to verify wallet status'
      }));
    }
  }, []);

  // Check verification when wallet connects
  useEffect(() => {
    if (connected && publicKey) {
      checkVerification(publicKey.toString());
    }
  }, [connected, publicKey, checkVerification]);

  const connect = async () => {
    try {
      setState(prev => ({ ...prev, isConnecting: true, error: null }));
      
      if (!wallet) {
        throw new Error('No wallet selected');
      }

      await connect();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to connect wallet'
      }));
    } finally {
      setState(prev => ({ ...prev, isConnecting: false }));
    }
  };

  const disconnect = async () => {
    if (publicKey) {
      verificationStorageService.clearVerification(publicKey.toString());
    }
    await disconnectWallet();
    setState({
      isConnecting: false,
      isVerifying: false,
      requiresVerification: false,
      isVerified: false,
      error: null
    });
  };

  return {
    // Wallet state
    isConnected: connected,
    isConnecting: state.isConnecting,
    isVerifying: state.isVerifying,
    requiresVerification: state.requiresVerification,
    isVerified: state.isVerified,
    error: state.error,
    wallet: publicKey?.toString() || null,
    
    // Actions
    connect,
    disconnect,
    selectWallet: select,
    
    // Verification
    checkVerification
  };
}
