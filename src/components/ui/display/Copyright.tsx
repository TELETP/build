// src/components/ui/display/Copyright.tsx
export function Copyright() {
    const currentYear = new Date().getFullYear();
    
    return (
      <div className="text-sm text-gray-500">
        © {currentYear} XTNCT. All rights reserved.
      </div>
    );
  }
  