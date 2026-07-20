import { createAction, props } from '@ngrx/store';
import { DashboardConfig, DashboardMetrics } from './dashboard.state';

export const loadDashboardConfigs = createAction('[Dashboard] Load Dashboard Configs');

export const loadDashboardConfigsSuccess = createAction(
  '[Dashboard] Load Dashboard Configs Success',
  props<{ configs: DashboardConfig[] }>(),
);

export const loadDashboardConfigsFailure = createAction(
  '[Dashboard] Load Dashboard Configs Failure',
  props<{ error: string }>(),
);

export const selectDashboardConfig = createAction(
  '[Dashboard] Select Dashboard Config',
  props<{ configId: string }>(),
);

export const createDashboardConfig = createAction(
  '[Dashboard] Create Dashboard Config',
  props<{ config: DashboardConfig }>(),
);

export const updateDashboardConfig = createAction(
  '[Dashboard] Update Dashboard Config',
  props<{ config: DashboardConfig }>(),
);

export const deleteDashboardConfig = createAction(
  '[Dashboard] Delete Dashboard Config',
  props<{ configId: string }>(),
);

export const loadDashboardMetrics = createAction('[Dashboard] Load Dashboard Metrics');

export const loadDashboardMetricsSuccess = createAction(
  '[Dashboard] Load Dashboard Metrics Success',
  props<{ metrics: DashboardMetrics }>(),
);

export const loadDashboardMetricsFailure = createAction(
  '[Dashboard] Load Dashboard Metrics Failure',
  props<{ error: string }>(),
);

export const updateDashboardMetricsRealtime = createAction(
  '[Dashboard] Update Dashboard Metrics Realtime',
  props<{ metrics: DashboardMetrics }>(),
);
