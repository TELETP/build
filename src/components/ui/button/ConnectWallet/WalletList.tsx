// src/components/ui/button/ConnectWallet/WalletList.tsx
'use client';

import Image from 'next/image';
import { DetectedWallet } from './index';

interface WalletListProps {
  wallets: DetectedWallet[];
  onSelect: (walletName: string) => void;
}

export default function WalletList({ wallets, onSelect }: WalletListProps) {
  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
      {wallets.map((wallet) => (
        <button
          key={wallet.name}
          onClick={() => onSelect(wallet.name)}
          className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2"
        >
          {wallet.iconPath && (
            <Image src={wallet.iconPath} alt={wallet.name} width={20} height={20} />
          )}
          <span>{wallet.name}</span>
        </button>
      ))}
    </div>
  );
}

