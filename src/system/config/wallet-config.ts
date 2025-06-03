// src/system/config/wallet-config.ts
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

export const WALLET_CONFIG = {
  network: WalletAdapterNetwork.Devnet,
  wallets: [
    // Phantom is automatically included as a standard wallet
    new SolflareWalletAdapter(),
  ],
  autoConnect: false
};
