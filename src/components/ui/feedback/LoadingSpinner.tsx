// src/components/ui/feedback/LoadingSpinner.tsx
export function LoadingSpinner({ 
    size = 'md',
    className = '' 
  }: LoadingSpinnerProps) {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8'
    };
  
    return (
      <div className={`inline-block animate-spin ${sizeClasses[size]} ${className}`}>
        <div className="w-full h-full border-2 border-current border-t-transparent rounded-full" />
      </div>
    );
  }
  