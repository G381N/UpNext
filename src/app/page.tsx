import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-4 font-headline">
          NextUp
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-muted-foreground mb-8">
          The smart task manager that helps you focus on what's next. Prioritize your work with AI and get more done.
        </p>
        <Button asChild size="lg">
          <Link href="/login">Get Started</Link>
        </Button>
      </main>
      <footer className="py-6 px-6 text-center text-muted-foreground">
        <p>
          Built by a friendly AI. Check out my human partner at{' '}
          <a
            href="https://gebin.net"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            gebin.net
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
