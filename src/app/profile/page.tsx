
"use client"; // Profile page might need client-side logic for fetching logged-in user's data

import { StudentProfileCard } from '@/components/profile/student-profile-card';
import { getStudentsWithPointsAndRank } from '@/lib/mock-data';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Student } from '@/lib/types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';


export default function ProfilePage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/login?redirect=/profile');
    } else if (currentUser) {
      // In a real app, fetch this student's profile data from Firestore using currentUser.uid
      // For now, we'll find them in mock data if they exist or use a default
      const students = getStudentsWithPointsAndRank();
      const loggedInStudent = students.find(s => s.name.toLowerCase().includes(currentUser.name?.split(' ')[0].toLowerCase() || '')); // Simple match
      
      if (loggedInStudent) {
        setStudentData(loggedInStudent);
      } else if (currentUser.role === 'student') {
        // Create a mock student profile if not found in mock-data, for display purposes
        setStudentData({
          id: currentUser.uid,
          name: currentUser.name || 'Student User',
          avatarUrl: 'https://placehold.co/100x100.png',
          accomplishments: [],
          totalPoints: 0,
          rank: undefined, // Rank would be determined globally
        });
      } else {
         // If admin or other role without a direct "student" profile in mock data
         setStudentData({
            id: currentUser.uid,
            name: currentUser.name || 'User Profile',
            avatarUrl: 'https://placehold.co/100x100.png',
            accomplishments: [], // Admins might not have accomplishments in this system
            totalPoints: 0,
         });
      }
      setLoadingProfile(false);
    }
  }, [currentUser, authLoading, router]);

  if (authLoading || loadingProfile) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!studentData) {
     return (
        <div className="container mx-auto py-8 flex justify-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Profile Not Found</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Could not load profile information. Please try again later.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <StudentProfileCard student={studentData} />
    </div>
  );
}
