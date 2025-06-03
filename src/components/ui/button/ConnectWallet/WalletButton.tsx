// src/components/ui/button/ConnectWallet/WalletButton.tsx
'use client';

import { ConnectWalletProps } from './types';

interface WalletButtonProps extends ConnectWalletProps {
  isConnected: boolean;
  onClick: () => void;
}

export default function WalletButton({
  isConnected,
  isLoading,
  onClick,
  className,
  ...props
}: WalletButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={`
        px-4 py-2 rounded-lg
        ${isConnected
          ? 'bg-red-500 hover:bg-red-600'
          : 'bg-blue-500 hover:bg-blue-600'
        }
        text-white font-medium
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
      {...props}
    >
      {isLoading ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect Wallet'}
    </button>
  );
}
