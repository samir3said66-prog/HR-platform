import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DashboardState } from './dashboard.state';

export const selectDashboardState = createFeatureSelector<DashboardState>('dashboard');

export const selectAllDashboardConfigs = createSelector(selectDashboardState, (state) =>
  state.configIds.map((id) => state.configs[id]),
);

export const selectDashboardConfigIds = createSelector(
  selectDashboardState,
  (state) => state.configIds,
);

export const selectDashboardConfigEntities = createSelector(
  selectDashboardState,
  (state) => state.configs,
);

export const selectCurrentDashboardConfigId = createSelector(
  selectDashboardState,
  (state) => state.currentConfigId,
);

export const selectCurrentDashboardConfig = createSelector(selectDashboardState, (state) =>
  state.currentConfigId ? state.configs[state.currentConfigId] : null,
);

export const selectDashboardMetrics = createSelector(
  selectDashboardState,
  (state) => state.metrics,
);

export const selectDashboardLoading = createSelector(
  selectDashboardState,
  (state) => state.loading,
);

export const selectDashboardError = createSelector(selectDashboardState, (state) => state.error);

export const selectDashboardConfigById = (configId: string) =>
  createSelector(selectDashboardConfigEntities, (entities) => entities[configId]);

export const selectDefaultDashboardConfig = createSelector(
  selectAllDashboardConfigs,
  (configs) => configs.find((c) => c.isDefault) || configs[0],
);

export const selectTotalHeadcount = createSelector(
  selectDashboardMetrics,
  (metrics) => metrics?.totalHeadcount || 0,
);

export const selectActiveEmployees = createSelector(
  selectDashboardMetrics,
  (metrics) => metrics?.activeEmployees || 0,
);

export const selectEmployeesOnLeave = createSelector(
  selectDashboardMetrics,
  (metrics) => metrics?.onLeave || 0,
);

export const selectNewHires = createSelector(
  selectDashboardMetrics,
  (metrics) => metrics?.newHires || 0,
);

export const selectDepartures = createSelector(
  selectDashboardMetrics,
  (metrics) => metrics?.departures || 0,
);
