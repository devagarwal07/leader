
"use client"; // This page uses hooks like useAuth and client-side form

import { RequestPointsForm } from '@/components/student/request-points-form';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function RequestPointsPage() {
  const { currentUser, loading: authLoading, isStudent } = useAuth(); // Renamed loading to authLoading for clarity
  const router = useRouter();

  useEffect(() => {
    if (authLoading) {
      return; // Wait until auth state is resolved
    }
    if (!currentUser) {
      router.push('/login?redirect=/request-points');
    } else if (currentUser && !isStudent) {
      router.push('/'); // Redirect non-students
    }
  }, [currentUser, authLoading, isStudent, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Verifying student access...</p>
      </div>
    );
  }
  
  if (!currentUser || !isStudent) {
    return (
        <div className="container mx-auto py-8 flex justify-center">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-6 w-6"/> Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">You must be logged in as a student to access this page.</p>
                     <p className="text-xs mt-2 text-muted-foreground">
                      If you believe you are a student, please ensure your user account in the database has the 'role' field correctly set to 'student'.
                      Check the browser's developer console for more detailed authentication logs from AuthContext.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <RequestPointsForm />
    </div>
  );
}
