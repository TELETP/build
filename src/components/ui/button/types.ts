// src/components/ui/button/types.ts
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
  }
  
  export interface ConnectWalletProps extends ButtonProps {
    onConnect?: () => void;
    onDisconnect?: () => void;
  }
  