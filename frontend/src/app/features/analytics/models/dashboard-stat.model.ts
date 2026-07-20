/**
 * Dashboard Stat Model
 */

export interface DashboardStat {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  previousValue?: number;
  changePercentage?: number;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
  icon?: string;
  details?: string;
}

export interface DashboardChart {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'area' | 'scatter';
  data: ChartData[];
  options?: ChartOptions;
}

export interface ChartData {
  label: string;
  value: number;
  color?: string;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  legend?: boolean;
  tooltips?: boolean;
}
