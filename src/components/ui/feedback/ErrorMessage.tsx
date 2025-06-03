// src/components/ui/feedback/ErrorMessage.tsx
export function ErrorMessage({ 
  message, 
  className = '',
  action
}: ErrorMessageProps) {
  return (
    <div className={`
      p-3 rounded-lg bg-red-50 border border-red-200
      ${className}
    `}>
      <p className="text-sm text-red-700">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
