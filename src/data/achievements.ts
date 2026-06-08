export type Achievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
  color: string;
};

export const achievements: Achievement[] = [
  {
    id: 'first-login',
    icon: 'log-in-outline',
    title: 'First Steps',
    description: 'Signed up for Nursphere',
    unlocked: true,
    color: '#0D9488',
  },
  {
    id: 'study-streak',
    icon: 'flame-outline',
    title: 'Study Streak',
    description: 'Completed 7 days of study',
    unlocked: true,
    color: '#F59E0B',
  },
  {
    id: 'roadmap-starter',
    icon: 'map-outline',
    title: 'Roadmap Starter',
    description: 'Began your career journey',
    unlocked: true,
    color: '#6366F1',
  },
  {
    id: 'community-first',
    icon: 'chatbubbles-outline',
    title: 'Community Voice',
    description: 'Made your first post',
    unlocked: true,
    color: '#EC4899',
  },
  {
    id: 'diagnosis-master',
    icon: 'medkit-outline',
    title: 'Diagnosis Master',
    description: 'Used AI diagnosis tool',
    unlocked: false,
    color: '#0D9488',
  },
  {
    id: 'drug-scholar',
    icon: 'medical-outline',
    title: 'Drug Scholar',
    description: 'Referenced 10 medications',
    unlocked: false,
    color: '#F59E0B',
  },
  {
    id: 'procedure-pro',
    icon: 'book-outline',
    title: 'Procedure Pro',
    description: 'Completed all nursing guides',
    unlocked: false,
    color: '#6366F1',
  },
  {
    id: 'nigerian-pride',
    icon: 'flag-outline',
    title: 'Naija Nurse',
    description: 'Embraced Nigerian nursing',
    unlocked: true,
    color: '#008751',
  },
];
