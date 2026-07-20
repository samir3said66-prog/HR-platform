/**
 * Dashboard Feature Store Configuration
 * Exports reducer and effects for feature store registration
 */

import { dashboardReducer } from './dashboard.reducer';
import { DashboardEffects } from './dashboard.effects';

export const DASHBOARD_STORE_CONFIG = {
  featureName: 'dashboard',
  reducer: dashboardReducer,
  effects: [DashboardEffects],
};

export { dashboardReducer, DashboardEffects };
