// src/system/types/wallet.ts
import { WalletAdapterNetwork, PublicKey } from '@solana/wallet-adapter-base';

interface PhantomWallet {
  isPhantom: boolean;
  publicKey?: PublicKey;
  network?: WalletAdapterNetwork;
  connect(opts?: { onlyIfTrusted: boolean, network?: WalletAdapterNetwork }): Promise<{ publicKey: PublicKey }>;
  disconnect(): Promise<void>;
  isConnected: boolean;
}

interface SolflareProvider {
  isSolflare: boolean;
  publicKey?: PublicKey; // Add publicKey to SolflareProvider
  network?: WalletAdapterNetwork; // Add network to SolflareProvider
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected: boolean;
}

interface WindowPhantom {
  solana: PhantomWallet;
}

declare global {
  interface Window {
    phantom?: WindowPhantom;
    solflare?: SolflareProvider;
  }
}

export {};

