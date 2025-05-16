
"use client"; // This page uses hooks like useAuth and client-side form

import { RequestPointsForm } from '@/components/student/request-points-form';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function RequestPointsPage() {
  const { currentUser, loading, isStudent } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/login?redirect=/request-points');
    } else if (!loading && currentUser && !isStudent) {
      router.push('/'); // Redirect non-students
    }
  }, [currentUser, loading, isStudent, router]);

  if (loading || !currentUser || !isStudent) {
    // You can show a loading spinner or a more specific access denied message
    return (
        <div className="container mx-auto py-8 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>You must be logged in as a student to access this page.</p>
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
