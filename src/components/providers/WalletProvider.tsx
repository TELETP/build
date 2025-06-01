// src/components/providers/WalletProvider.tsx
'use client';

import { useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { SOLANA_CONFIG } from '@/system/config/solana';
import { WALLET_CONFIG } from '@/system/config/wallet-config';

// Import styles directly
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const wallets = useMemo(() => WALLET_CONFIG.wallets, []);

  return (
    <ConnectionProvider endpoint={SOLANA_CONFIG.RPC_ENDPOINT}>
      <SolanaWalletProvider wallets={wallets} autoConnect={WALLET_CONFIG.autoConnect}>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
