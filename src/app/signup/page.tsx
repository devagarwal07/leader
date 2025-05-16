
"use client"; // Need this for useEffect and useRouter

import { SignupForm } from '@/components/auth/signup-form';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function SignupPage() {
  const { currentUser, loading: authLoading } = useAuth(); // Renamed loading to authLoading
  const router = useRouter();

  useEffect(() => {
    // If auth is not loading AND a user is logged in, redirect them from the signup page.
    if (!authLoading && currentUser) {
      if (currentUser.role === 'admin') {
        router.push('/admin/dashboard');
      } else if (currentUser.role === 'student') {
        router.push('/profile');
      } else {
        router.push('/'); // Fallback
      }
    }
  }, [currentUser, authLoading, router]);

  // Show loader while authLoading is true, OR if authLoading is false but currentUser exists (implying a redirect is imminent).
  if (authLoading || (!authLoading && currentUser)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading session...</p>
      </div>
    );
  }

  // Only render SignupForm if not loading and no user is logged in
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <SignupForm />
    </div>
  );
}
