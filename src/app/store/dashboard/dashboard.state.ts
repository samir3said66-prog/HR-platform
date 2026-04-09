export interface DashboardConfig {
  id: string;
  name: string;
  layout: 'grid' | 'list';
  widgets: DashboardWidget[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'metric';
  title: string;
  position: {
    row: number;
    col: number;
    width: number;
    height: number;
  };
  config: Record<string, any>;
  refreshInterval?: number;
}

export interface DashboardMetrics {
  totalHeadcount: number;
  activeEmployees: number;
  onLeave: number;
  newHires: number;
  departures: number;
  lastUpdated: string;
}

export interface DashboardState {
  configs: { [id: string]: DashboardConfig };
  configIds: string[];
  currentConfigId: string | null;
  metrics: DashboardMetrics | null;
  loading: boolean;
  error: string | null;
}

export const initialDashboardState: DashboardState = {
  configs: {},
  configIds: [],
  currentConfigId: null,
  metrics: null,
  loading: false,
  error: null,
};
