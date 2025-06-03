// src/components/providers/WalletProvider.tsx
'use client';

import { useMemo } from 'react';
import { ConnectionProvider } from '@solana/wallet-adapter-react';
import { SOLANA_CONFIG } from '@/system/config/solana';
import { WALLET_CONFIG } from '@/system/config/wallet-config';

interface WalletProviderProps {
  children: React.ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const endpoint = useMemo(() => SOLANA_CONFIG.RPC_ENDPOINT, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      {children}
    </ConnectionProvider>
  );
}
