export interface PerformanceMetric {
  id: string;
  employeeId: string;
  score: number;
  reviewDate: string;
  trend: 'up' | 'down' | 'stable';
  department: string;
}

export interface PerformanceState {
  entities: { [id: string]: PerformanceMetric };
  ids: string[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export const initialPerformanceState: PerformanceState = {
  entities: {},
  ids: [],
  loading: false,
  error: null,
  lastUpdated: null,
};
