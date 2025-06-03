// src/system/types/wallets.ts

interface PhantomWallet {
  isPhantom: boolean;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected: boolean;
}

interface SolflareProvider {
  isSolflare: boolean;
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

