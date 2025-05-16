import { StudentProfileCard } from '@/components/profile/student-profile-card';
import { getStudentsWithPointsAndRank } from '@/lib/mock-data';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  // For this mock-up, we'll display the profile of the first student.
  // In a real app, this would be based on the logged-in user.
  const students = getStudentsWithPointsAndRank();
  const student = students[0];

  if (!student) {
    // Handle case where no student data is available (e.g., redirect or show error)
    // For now, redirecting to home, but a proper error/empty state page would be better.
    return redirect('/');
  }

  return (
    <div className="container mx-auto py-8">
      <StudentProfileCard student={student} />
    </div>
  );
}
