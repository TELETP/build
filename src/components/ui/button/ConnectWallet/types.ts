// src/components/ui/button/ConnectWallet/types.ts
import { ButtonProps } from '../types';

export interface ConnectWalletProps extends ButtonProps {
  onConnect?: () => void;
  onDisconnect?: () => void;
}

