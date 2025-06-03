// src/components/ui/button/ConnectWallet/index.tsx
'use client';

import { useState, useEffect, useCallback } from 'react'; // Import useEffect
import { ConnectWalletProps } from './types';
import { ErrorMessage } from '../../feedback/ErrorMessage';
import WalletButton from './WalletButton';
import WalletList from './WalletList';
import useWalletConnection from './useWalletConnection';
import useWalletDetection from './useWalletDetection';

export default function ConnectWallet({
  className = '',
  onConnect,
  onDisconnect,
  ...props
}: ConnectWalletProps) {
  const {
    isConnected,
    isConnecting,
    connect,
    disconnect,
    error: connectionError,
    selectedWallet
  } = useWalletConnection({ onConnect, onDisconnect });

  const { detectedWallets, hasAvailableWallets, error: detectionError } = useWalletDetection();

  const [showWalletList, setShowWalletList] = useState(false);
  const [error, setError] = useState<string | null>(connectionError || detectionError);

  useEffect(() => {
    setError(connectionError || detectionError);
  }, [connectionError, detectionError]);

  const handleClick = () => {
    if (isConnected) {
      disconnect();
    } else if (!hasAvailableWallets) {
      setError('Please install a Solana wallet (Phantom or Solflare)');
    } else if (detectedWallets.length === 1 && selectedWallet) {
      connect(selectedWallet);
    } else {
      setShowWalletList(!showWalletList);
    }
  };

  return (
    <div className="relative">
      <WalletButton
        isConnected={isConnected}
        isLoading={isConnecting}
        onClick={handleClick}
        className={className}
        {...props}
      />

      {showWalletList && !isConnected && (
        <WalletList
          wallets={detectedWallets}
          onSelect={connect}
        />
      )}

      {error && (
        <div className="absolute right-0 mt-2 w-64">
          <ErrorMessage
            message={error}
            action={
              !hasAvailableWallets ? {
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
