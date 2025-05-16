
"use client"; // Need this for useEffect and useRouter

import { SignupForm } from '@/components/auth/signup-form';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      // If user is already logged in and not loading, redirect from signup page
      router.push('/');
    }
  }, [currentUser, loading, router]);

  // Show loader while checking auth or if about to redirect
  if (loading || (!loading && currentUser)) { 
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <SignupForm />
    </div>
  );
}
