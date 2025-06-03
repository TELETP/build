'use client';

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

const WalletChecker = () => {
  const { publicKey, connected } = useWallet();

  useEffect(() => {
    const checkWallet = async () => {
      // First check if Phantom or other Solana wallet extension exists
      if ('solana' in window) {
        console.log('wallet extension/app found');
        
        // Check if wallet is connected using wallet adapter
        if (connected && publicKey) {
          console.log('wallet available');
        } else {
          console.log('wallet not available');
        }
      } else {
        console.log('wallet extension/app not found');
      }
    };

    checkWallet();
  }, [connected, publicKey]);

  return null;
};

export default WalletChecker;
