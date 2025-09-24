import Link from 'next/link';
import { Button } from '../ui/button';
import { Logo } from './logo';
import { ChevronLeft } from 'lucide-react';
import { ThemeSwitch } from './theme-switch';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" className="h-8 w-8">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
            </Button>
            <Link href="/" className="text-xl font-headline font-bold tracking-tight text-foreground">
                NextUp
            </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <Button asChild>
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
