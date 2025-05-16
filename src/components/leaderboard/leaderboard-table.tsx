import Image from 'next/image';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Award, Medal, Star } from 'lucide-react';
import type { Student } from '@/lib/types';

interface LeaderboardTableProps {
  students: Student[];
}

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Award className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-slate-400" />;
  if (rank === 3) return <Star className="h-5 w-5 text-orange-400" />;
  return <Badge variant="secondary" className="text-xs">{rank}</Badge>;
};


export function LeaderboardTable({ students }: LeaderboardTableProps) {
  return (
    <div className="rounded-lg border shadow-sm bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Rank</TableHead>
            <TableHead>Student</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell>
                <div className="flex items-center justify-center h-10 w-10">
                  {student.rank !== undefined && <RankIcon rank={student.rank} />}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={student.avatarUrl} alt={student.name} data-ai-hint="person student" />
                    <AvatarFallback>{student.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{student.name}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1 font-semibold">
                  <Star className="h-4 w-4 text-yellow-400" />
                  {student.totalPoints ?? 0}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
