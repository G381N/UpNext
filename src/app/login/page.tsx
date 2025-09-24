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
        <path
            d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.05 1.05-2.86 2.25-5.11 2.25-4.34 0-7.88-3.57-7.88-7.95s3.54-7.95 7.88-7.95c2.44 0 4.01.99 4.91 1.86l2.6-2.58C18.09 2.1 15.71 1 12.48 1 7.03 1 3 5.03 3 10.5s4.03 9.5 9.48 9.5c5.05 0 8.32-3.41 8.32-8.56 0-.52-.05-1.03-.12-1.5H12.48z"
            fill="currentColor"
        />
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
            <div className="mx-auto mb-4 flex items-center justify-center gap-1">
                <Logo iconClassName="h-10 w-10" className="gap-0" />
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
