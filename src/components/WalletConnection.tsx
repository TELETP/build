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

  // Conceptual Improvement for Error Handling:
  // The PhoneVerification.tsx component (or any component directly using VerificationService)
  // can catch VerificationError and set more specific error messages based on error.code.
  // For example, if PhoneVerification.tsx had an onError prop:
  //
  // In PhoneVerification.tsx (conceptual):
  // } catch (err) {
  //   if (err instanceof VerificationError) {
  //     switch (err.code) {
  //       case 'SEND_CODE_ERROR':
  //         onError("Failed to send the verification code. Please try again.");
  //         break;
  //       case 'INVALID_CODE':
  //         onError("The code you entered is invalid. Please check and try again.");
  //         break;
  //       case 'MAX_ATTEMPTS_REACHED': // Assuming VerificationError could have this code
  //         onError("You've reached the maximum verification attempts. Please try again later.");
  //         break;
  //       default:
  //         onError(err.message || "An unexpected error occurred during verification.");
  //     }
  //   } else {
  //     onError("An unexpected error occurred.");
  //   }
  // }
  //
  // Then, WalletConnection.tsx could receive this specific message via the onError prop
  // and display it, instead of the generic messages currently set in handleConnect
  // or handleVerificationComplete.
  //
  // Similarly, if `handleConnection` or `useWalletConnection` were to propagate
  // `VerificationError` from underlying service calls, this component could implement
  // a similar switch statement for its `state.error`.
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
