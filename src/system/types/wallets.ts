import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

interface PhantomWallet {
  isPhantom: boolean;
  publicKey?: { toBytes(): Uint8Array; toString(): string };
  network?: WalletAdapterNetwork;
  connect(opts?: { onlyIfTrusted: boolean, network?: WalletAdapterNetwork }): Promise<{ publicKey: PublicKey }>;
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
