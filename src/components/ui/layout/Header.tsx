// src/components/ui/layout/Header.tsx
'use client';

import { ConnectWallet } from '../button/ConnectWallet';
import { TokenPrice } from '../display/TokenPrice';
import { ProjectTokenPrice } from '../display/ProjectTokenPrice';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="space-y-2">
        <TokenPrice />
        <ProjectTokenPrice />
      </div>
      <ConnectWallet />
    </header>
  );
}
