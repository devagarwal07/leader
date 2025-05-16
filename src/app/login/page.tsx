
"use client"; // Need this for useEffect and useRouter

import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!loading && currentUser) {
      // If user is already logged in and not loading, redirect from login page
      const redirectUrl = searchParams.get('redirect') || '/';
      router.push(redirectUrl);
    }
  }, [currentUser, loading, router, searchParams]);

  // Show loader while checking auth or if about to redirect
  // This ensures the page doesn't flash the form if a redirect is imminent.
  if (loading || (!loading && currentUser)) { 
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  );
}
