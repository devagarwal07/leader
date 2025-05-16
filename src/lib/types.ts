export interface Accomplishment {
  id: string;
  title: string;
  description: string;
  category: string;
  pointsAwarded: number;
  dateAdded: string; // ISO date string
}

export interface Student {
  id: string;
  name: string;
  avatarUrl: string;
  accomplishments: Accomplishment[];
  // Calculated properties, can be added dynamically
  totalPoints?: number;
  rank?: number;
}
