/**
 * Performance Review Model
 */

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string; // e.g., "Q1 2024"
  overallRating: number; // 1-5
  comments?: string;
  strengths?: string[];
  areasForImprovement?: string[];
  goals?: PerformanceGoal[];
  status: 'draft' | 'pending' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  completionDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'abandoned';
  progress?: number;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  benchmark?: number;
  trend?: 'up' | 'down' | 'stable';
}
