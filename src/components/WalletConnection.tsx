// src/components/WalletConnection.tsx
import { useEffect, useState } from 'react';
import { useWalletConnection } from '@/system/services/wallet/connection';
import { verificationService } from '@/system/services/auth/verification';
import { verificationStorageService } from '@/system/services/auth/storage';
import PhoneVerification from './PhoneVerification';

interface WalletConnectionState {
  requiresVerification: boolean;
  isVerified: boolean;
  error: string | null;
}

export default function WalletConnection() {
  const { 
    connectWallet, 
    handleConnection, 
    disconnect,
    isConnected,
    isConnecting,
    wallet,
    selectWallet
  } = useWalletConnection();

  const [state, setState] = useState<WalletConnectionState>({
    requiresVerification: false,
    isVerified: false,
    error: null
  });

  const handleConnect = async () => {
    setState(prev => ({ ...prev, error: null }));
    
    try {
      const walletAddress = await connectWallet();
      const { requiresVerification, isVerified } = 
        await handleConnection(walletAddress);

      setState(prev => ({
        ...prev,
        requiresVerification,
        isVerified
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }));
    }
  };

  const handleVerificationComplete = async () => {
    if (!wallet) return;

    try {
      await verificationService.updateVerificationStatus(wallet, true);
      verificationStorageService.storeVerification(wallet);
      
      setState(prev => ({
        ...prev,
        requiresVerification: false,
        isVerified: true
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to update verification status'
      }));
    }
  };

  return (
    <div className="wallet-connection">
      {!isConnected ? (
        <button 
          onClick={handleConnect}
          disabled={isConnecting}
          className="connect-button"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : state.requiresVerification ? (
        <div className="verification-container">
          <p className="verification-notice">Phone verification required</p>
          <PhoneVerification 
            onVerificationComplete={handleVerificationComplete} 
          />
        </div>
      ) : (
        <div className="connected-container">
          <p className="status-text">Wallet connected and verified</p>
          <p className="wallet-address">{wallet}</p>
          <button 
            onClick={disconnect}
            className="disconnect-button"
          >
            Disconnect
          </button>
        </div>
      )}

      {state.error && (
        <div className="error-message">
          {state.error}
        </div>
      )}
    </div>
  );
}
