// src/components/ui/feedback/ErrorMessage.tsx
export function ErrorMessage({ 
    message, 
    className = '',
    onRetry 
  }: ErrorMessageProps) {
    return (
      <div className={`
        p-4 rounded-lg bg-red-50 border border-red-200
        ${className}
      `}>
        <p className="text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        )}
      </div>
    );
  }
  