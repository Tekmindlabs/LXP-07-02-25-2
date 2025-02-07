'use client';

import { Suspense } from 'react'
import { Header } from '@/components/layout/header';
import { Hero } from '@/components/home/hero';
import { Features } from '@/components/home/features';
import { Footer } from '@/components/layout/footer';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function Home() {
  const router = useRouter();

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, var(--background), var(--secondary))',
    position: 'relative' as const,
  };

  const buttonContainerStyle = {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center' as const,
    zIndex: 10,
  };

  const handleSignIn = () => {
    router.push('/auth/signin');
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div style={containerStyle}>
      <Header />
      <div style={buttonContainerStyle}>
        <Button 
          variant="default" 
          size="lg" 
          onClick={handleSignIn}
          style={{
            padding: '1.5rem 3rem',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s ease-in-out',
            cursor: 'pointer',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          Sign In
        </Button>
      </div>
      <Hero />
      <Features />
      <Footer />
    </div>
    </Suspense>
  );
}