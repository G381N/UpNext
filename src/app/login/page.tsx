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

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.62 2.04-5.07 2.04-4.34 0-7.88-3.57-7.88-7.96s3.55-7.96 7.88-7.96c2.38 0 4.03.98 4.98 1.9l2.6-2.6C18.47 1.94 15.96 1 12.48 1 5.88 1 1 5.98 1 12.5s4.88 11.5 11.48 11.5c6.5 0 11.22-4.4 11.22-11.26 0-.75-.08-1.48-.2-2.18h-11z" />
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
        <div className="absolute top-4 right-4">
            <ThemeSwitch />
        </div>
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
            <div className="mx-auto mb-4">
                <Logo className="gap-1" iconClassName="h-12 w-12" />
            </div>
            <CardTitle className="font-headline text-3xl tracking-tight">Welcome to NextUp</CardTitle>
            <CardDescription>The smartest way to organize your tasks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} size="lg" className="w-full">
            <GoogleIcon className="mr-2 h-5 w-5 fill-current" />
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
