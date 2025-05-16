import type { Student } from './types';

export const mockStudents: Student[] = [
  {
    id: '1',
    name: 'Alice Wonderland',
    avatarUrl: 'https://placehold.co/100x100.png',
    accomplishments: [
      { id: 'a1', title: 'Math Olympiad Winner', description: 'Achieved 1st place in the regional Math Olympiad.', category: 'Academics', pointsAwarded: 150, dateAdded: '2023-05-10T00:00:00.000Z' },
      { id: 'a2', title: 'Science Fair Project', description: 'Developed a volcano simulation for the science fair.', category: 'Science', pointsAwarded: 100, dateAdded: '2023-04-20T00:00:00.000Z' },
      { id: 'a3', title: 'Debate Club President', description: 'Led the debate club to a state championship.', category: 'Leadership', pointsAwarded: 120, dateAdded: '2023-03-15T00:00:00.000Z' },
    ],
  },
  {
    id: '2',
    name: 'Bob The Builder',
    avatarUrl: 'https://placehold.co/100x100.png',
    accomplishments: [
      { id: 'b1', title: 'Coding Competition Finalist', description: 'Reached finals in the national coding challenge.', category: 'Technology', pointsAwarded: 130, dateAdded: '2023-06-01T00:00:00.000Z' },
      { id: 'b2', title: 'Volunteer Tutor', description: 'Tutored underprivileged students in mathematics for 50+ hours.', category: 'Community Service', pointsAwarded: 90, dateAdded: '2023-05-25T00:00:00.000Z' },
    ],
  },
  {
    id: '3',
    name: 'Charlie Brown',
    avatarUrl: 'https://placehold.co/100x100.png',
    accomplishments: [
      { id: 'c1', title: 'Art Exhibition Feature', description: 'Artwork featured in the city\'s annual art exhibition.', category: 'Arts', pointsAwarded: 110, dateAdded: '2023-04-05T00:00:00.000Z' },
    ],
  },
  {
    id: '4',
    name: 'Diana Prince',
    avatarUrl: 'https://placehold.co/100x100.png',
    accomplishments: [
      { id: 'd1', title: 'Sports Captain', description: 'Captain of the school soccer team, led to victory.', category: 'Sports', pointsAwarded: 140, dateAdded: '2023-05-12T00:00:00.000Z' },
      { id: 'd2', title: 'Perfect Attendance', description: 'Maintained perfect attendance for the entire school year.', category: 'Discipline', pointsAwarded: 50, dateAdded: '2023-06-05T00:00:00.000Z' },
      { id: 'd3', title: 'Music Recital', description: 'Performed a solo piano piece at the annual music recital.', category: 'Arts', pointsAwarded: 80, dateAdded: '2023-03-20T00:00:00.000Z' },
    ],
  },
];

// Function to calculate total points for each student
export const getStudentsWithPointsAndRank = (): Student[] => {
  const studentsWithPoints = mockStudents.map(student => ({
    ...student,
    totalPoints: student.accomplishments.reduce((sum, acc) => sum + acc.pointsAwarded, 0),
  }));

  studentsWithPoints.sort((a, b) => (b.totalPoints ?? 0) - (a.totalPoints ?? 0));

  return studentsWithPoints.map((student, index) => ({
    ...student,
    rank: index + 1,
  }));
};
