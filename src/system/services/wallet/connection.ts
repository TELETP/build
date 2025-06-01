// src/system/services/wallet/connection.ts
import { useWallet } from '@solana/wallet-adapter-react';
import { verificationService } from '../auth/verification';
import { verificationStorageService } from '../auth/storage';

export class WalletConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletConnectionError';
  }
}

export function useWalletConnection() {
  const { 
    publicKey, 
    connected, 
    connecting,
    connect, 
    disconnect: disconnectWallet,
    select,
    wallet
  } = useWallet();

  const connectWallet = async (): Promise<string> => {
    try {
      if (!wallet) {
        throw new WalletConnectionError('No wallet selected');
      }

      await connect();
      
      if (!publicKey) {
        throw new WalletConnectionError('Failed to connect wallet');
      }

      return publicKey.toString();
    } catch (error) {
      console.error('Wallet connection failed:', error);
      throw new WalletConnectionError(
        error instanceof Error ? error.message : 'Failed to connect wallet'
      );
    }
  };

  const handleConnection = async (wallet: string): Promise<{
    requiresVerification: boolean;
    isVerified: boolean;
  }> => {
    try {
      // Check local storage first for quick response
      const localVerification = verificationStorageService.isVerified(wallet);
      if (localVerification) {
        return {
          requiresVerification: false,
          isVerified: true
        };
      }

      // Check Firestore for verification status
      const isVerified = await verificationService.isWalletVerified(wallet);
      
      if (isVerified) {
        // Update local storage if verified in Firestore but not in local
        verificationStorageService.storeVerification(wallet);
      }

      return {
        requiresVerification: !isVerified,
        isVerified
      };
    } catch (error) {
      console.error('Error handling wallet connection:', error);
      throw new WalletConnectionError('Failed to verify wallet status');
    }
  };

  const disconnect = async (): Promise<void> => {
    if (publicKey) {
      verificationStorageService.clearVerification(publicKey.toString());
    }
    await disconnectWallet();
  };

  return {
    connectWallet,
    handleConnection,
    disconnect,
    isConnected: connected,
    isConnecting: connecting,
    wallet: publicKey?.toString() || null,
    selectWallet: select
  };
}
