import { LeaderboardTable } from '@/components/leaderboard/leaderboard-table';
import { getStudentsWithPointsAndRank } from '@/lib/mock-data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default async function LeaderboardPage() {
  const students = getStudentsWithPointsAndRank();

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Leaderboard</CardTitle>
          <CardDescription>Top students by points accumulated.</CardDescription>
        </CardHeader>
        <CardContent>
          <LeaderboardTable students={students} />
        </CardContent>
      </Card>
    </div>
  );
}
