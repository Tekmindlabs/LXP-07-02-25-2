import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Hero() {
  return (
    <main className="container mx-auto px-4 py-20 text-center">
      <h1 className="text-5xl font-bold mb-6">
        Role-Based Access Control System
      </h1>
      <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
        A scalable and type-safe RBAC system built with modern web technologies.
        Perfect for enterprise applications requiring fine-grained access control.
      </p>
      <div className="flex justify-center gap-4">
        <Link href="/auth/signin">
          <Button size="lg" className="px-8">
            Get Started
          </Button>
        </Link>
        <a href="https://github.com/yourusername/rbac-starter" target="_blank" rel="noopener noreferrer">
          <Button size="lg" variant="outline" className="px-8">
            View on GitHub
          </Button>
        </a>
      </div>
    </main>
  );
}