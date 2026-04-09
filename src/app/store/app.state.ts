import { EmployeeState } from './employees/employees.state';
import { PerformanceState } from './performance/performance.state';
import { PreferencesState } from './preferences/preferences.state';
import { DashboardState } from './dashboard/dashboard.state';

export interface AppState {
  employees: EmployeeState;
  performance: PerformanceState;
  preferences: PreferencesState;
  dashboard: DashboardState;
}
