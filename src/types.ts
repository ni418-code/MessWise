export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export type FeedbackCategory = 'taste' | 'quality' | 'hygiene' | 'quantity';

export type HostelBlock = 'LH-1' | 'LH-2' | 'LH-3' | 'MH-1' | 'MH-2' | 'MH-3' | 'MH-4';

export interface StudentProfile {
  studentId: string;
  name?: string;
  hostelBlock: HostelBlock;
  roomNumber?: string;
}

export interface AuthorityProfile {
  username: string;
  role: string;
  title: string;
}

export interface FeedbackRating {
  id: string;
  studentId: string;
  studentName?: string;
  hostelBlock: HostelBlock | string;
  roomNumber?: string;
  date: string; // YYYY-MM-DD
  meal: MealType;
  taste: number; // 1 - 5
  quality: number; // 1 - 5
  hygiene: number; // 1 - 5
  quantity: number; // 1 - 5
  overallScore: number; // average
  tags: string[];
  comment: string;
  createdAt: string;
  status: 'submitted' | 'investigating' | 'action_taken' | 'resolved';
  authorityNote?: string;
}

export interface MealSchedule {
  meal: MealType;
  label: string;
  timeRange: string;
  menuHighlights: string[];
  chefInCharge: string;
}

export type ActionStatus = 'not_resolved' | 'in_progress' | 'completed';

export interface AdministrativeAction {
  id: string;
  date: string;
  meal: MealType | 'all';
  category: FeedbackCategory | 'general';
  title: string;
  description: string;
  authorityRole: string;
  status: ActionStatus;
  outcome?: string;
}

export interface DailyTrendPoint {
  date: string;
  displayDate: string;
  breakfast: number;
  lunch: number;
  snacks: number;
  dinner: number;
  overall: number;
  submissionCount: number;
}

export interface IssuePattern {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  meal: MealType | 'all';
  category: FeedbackCategory;
  headline: string;
  frequencyText: string;
  suggestedAction: string;
  relatedSubmissionCount: number;
}
