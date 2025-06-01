// src/app/page.tsx

import { Container } from '@/components/ui/layout/Container';
import { Header } from '@/components/ui/layout/Header';
import { Footer } from '@/components/ui/layout/Footer';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Container className="flex-1 py-8">
        {/* Main content will go here */}
      </Container>
      <Footer />
    </div>
  );
}
