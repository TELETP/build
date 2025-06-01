// src/components/ui/layout/Footer.tsx
import { Copyright } from '../display/Copyright';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-6 flex justify-center">
        <Copyright />
      </div>
    </footer>
  );
}
