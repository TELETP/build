// src/components/ui/button/ConnectWallet/useWalletDetection.ts
import { useState, useEffect, useCallback } from 'react';

import '@/system/types/wallet';

interface DetectedWallet {
  name: string;
  installed: boolean;
  iconPath?: string;
}

const useWalletDetection = () => {
  const [detectedWallets, setDetectedWallets] = useState<DetectedWallet[]>([]);
  const [hasAvailableWallets, setHasAvailableWallets] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkWallets = useCallback(() => {
    const wallets: DetectedWallet[] = [];

    try {
      if (window.phantom?.solana?.isPhantom) {
        wallets.push({ name: 'Phantom', installed: true, iconPath: '/phantom-icon.png' });
      }
    } catch (error) {
      console.error('Error detecting Phantom:', error);
      setError('Failed to detect Phantom wallet');
    }

    try {
      if (window.solflare?.isSolflare) {
        wallets.push({ name: 'Solflare', installed: true, iconPath: '/solflare-icon.png' });
      }
    } catch (error) {
      console.error('Error detecting Solflare:', error);
      setError('Failed to detect Solflare wallet');
    }

    setDetectedWallets(wallets);
    setHasAvailableWallets(wallets.length > 0);
  }, []);

  useEffect(() => {
    checkWallets();
    window.addEventListener('load', checkWallets);
    return () => window.removeEventListener('load', checkWallets);
  }, [checkWallets]);

  return {
    detectedWallets,
    hasAvailableWallets,
    error
  };
};

export default useWalletDetection;
