import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, CalendarDays, Tag } from 'lucide-react';
import type { Accomplishment } from '@/lib/types';
import { format } from 'date-fns';

interface AccomplishmentCardProps {
  accomplishment: Accomplishment;
}

export function AccomplishmentCard({ accomplishment }: AccomplishmentCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="text-xl">{accomplishment.title}</CardTitle>
        <CardDescription className="flex items-center gap-2 pt-1">
            <Tag className="h-4 w-4 text-muted-foreground" /> 
            <Badge variant="outline">{accomplishment.category}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{accomplishment.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-1 text-primary font-semibold">
          <Star className="h-4 w-4" />
          <span>{accomplishment.pointsAwarded} Points</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{format(new Date(accomplishment.dateAdded), 'PPP')}</span>
        </div>
      </CardFooter>
    </Card>
  );
}
