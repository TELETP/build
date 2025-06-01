// src/components/ui/feedback/types.ts
export interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
  }
  
  export interface ErrorMessageProps {
    message: string;
    className?: string;
    onRetry?: () => void;
  }
  