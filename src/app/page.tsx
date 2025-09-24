import { BrainCircuit, Zap, SquareCheckBig } from 'lucide-react';
import AnimatedLandingPage from '@/components/app/animated-landing-page';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-6 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter mb-2 font-headline">
          NextUp
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
          The smart task manager that helps you focus on what's next.
        </p>
      </header>

      <AnimatedLandingPage />

      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-background rounded-full shadow-md mb-4">
                <BrainCircuit className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Prioritization</h3>
              <p className="text-muted-foreground">
                Let AI organize your tasks based on what's most important and fastest to complete.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-background rounded-full shadow-md mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Build Momentum</h3>
              <p className="text-muted-foreground">
                Knock out quick wins first to build momentum and stay motivated throughout your day.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="p-4 bg-background rounded-full shadow-md mb-4">
                <SquareCheckBig className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stay Organized</h3>
              <p className="text-muted-foreground">
                Keep your projects tidy with simple folders and a clean, focused interface.
              </p>
            </div>
          </div>
        </div>
      </section>

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
