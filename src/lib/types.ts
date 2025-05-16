
export interface Accomplishment {
  id: string;
  title: string;
  description: string;
  category: string;
  pointsAwarded: number;
  dateAdded: string; // ISO date string
}

export interface Student {
  id: string; // This would be Firebase UID if fully migrated
  name: string;
  avatarUrl: string;
  accomplishments: Accomplishment[];
  // Calculated properties, can be added dynamically
  totalPoints?: number;
  rank?: number;
}

export interface User {
  uid: string;
  email: string | null;
  name: string | null;
  role: 'student' | 'admin' | null;
}

export interface PointRequest {
  id: string; // Firestore document ID
  userId: string;
  studentName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: any; // Firestore Timestamp or serverTimestamp()
  reviewedAt?: any; // Firestore Timestamp
  pointsAwarded?: number;
  adminNotes?: string;
}
