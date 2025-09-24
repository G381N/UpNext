'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/app/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSwitch } from '@/components/app/theme-switch';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C6.48 1.5 2 5.98 2 12.5s4.48 11 10 11c5.52 0 10-4.48 10-11S17.52 1.5 12 1.5zM12 21.5c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9zm-2.7-9.04h7.4v-1.92h-7.4v1.92zm3.7-3.72c.98 0 1.8.82 1.8 1.8s-.82 1.8-1.8 1.8-1.8-.82-1.8-1.8.82-1.8 1.8-1.8z" fill="black" />
    </svg>
);

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/folders');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/folders');
    } catch (error) {
      console.error('Error signing in with Google: ', error);
    }
  };
  
  if (loading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="absolute top-4 left-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Back to Landing Page</span>
                </Link>
            </Button>
        </div>
        <div className="absolute top-4 right-4">
            <ThemeSwitch />
        </div>
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <Logo className="gap-1" iconClassName="h-10 w-10" />
            </div>
            <CardTitle className="font-headline text-3xl tracking-tight">Welcome to NextUp</CardTitle>
            <CardDescription>The smartest way to organize your tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} size="lg" className="w-full">
            <GoogleIcon className="mr-2 h-5 w-5" />
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
