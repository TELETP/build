// src/components/ui/feedback/types.ts
export interface ErrorMessageProps {
  message: string;
  className?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
