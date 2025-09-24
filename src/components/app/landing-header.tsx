import Link from 'next/link';
import { Button } from '../ui/button';

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-screen-2xl items-center justify-end px-4">
        <Button asChild>
          <Link href="/login">Get Started</Link>
        </Button>
      </div>
    </header>
  );
}
