// src/components/ui/layout/Container.tsx
export function Container({ 
    children, 
    className = '',
    maxWidth = 'lg'
  }: ContainerProps) {
    const maxWidthClasses = {
      sm: 'max-w-screen-sm',
      md: 'max-w-screen-md',
      lg: 'max-w-screen-lg',
      xl: 'max-w-screen-xl'
    };
  
    return (
      <div className={`
        mx-auto px-4 w-full
        ${maxWidthClasses[maxWidth]}
        ${className}
      `}>
        {children}
      </div>
    );
  }
  