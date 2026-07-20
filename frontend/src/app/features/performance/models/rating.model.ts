/**
 * Rating Model
 */

export interface Rating {
  id: string;
  category: string;
  score: number; // 1-5
  weight?: number;
  comments?: string;
}

export const RATING_SCALE = {
  1: { label: 'Below Average', color: 'red' },
  2: { label: 'Average', color: 'orange' },
  3: { label: 'Good', color: 'yellow' },
  4: { label: 'Very Good', color: 'lightgreen' },
  5: { label: 'Excellent', color: 'green' },
};
