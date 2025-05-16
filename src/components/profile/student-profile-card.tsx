import Image from 'next/image';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Award } from 'lucide-react';
import type { Student } from '@/lib/types';
import { AccomplishmentCard } from './accomplishment-card';

interface StudentProfileCardProps {
  student: Student;
}

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  return (
    <Card className="shadow-xl">
      <CardHeader className="items-center text-center border-b pb-6">
        <Avatar className="h-24 w-24 mb-4 ring-4 ring-primary ring-offset-2 ring-offset-background">
          <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="person student" />
          <AvatarFallback className="text-3xl">{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-3xl">{student.name}</CardTitle>
        <div className="flex items-center gap-4 text-muted-foreground mt-2">
            {student.rank !== undefined && (
                 <div className="flex items-center gap-1">
                    <Award className="h-5 w-5 text-primary" />
                    <span>Rank: {student.rank}</span>
                </div>
            )}
            <div className="flex items-center gap-1">
                <Star className="h-5 w-5 text-yellow-400" />
                <span>Total Points: {student.totalPoints ?? 0}</span>
            </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <h3 className="text-xl font-semibold mb-4 text-center">Accomplishments</h3>
        {student.accomplishments.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {student.accomplishments.map((acc) => (
              <AccomplishmentCard key={acc.id} accomplishment={acc} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No accomplishments yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
