import { createReducer, on } from '@ngrx/store';
import { DashboardState, initialDashboardState } from './dashboard.state';
import * as DashboardActions from './dashboard.actions';

export const dashboardReducer = createReducer(
  initialDashboardState,
  on(DashboardActions.loadDashboardConfigs, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(DashboardActions.loadDashboardConfigsSuccess, (state, { configs }) => {
    const configsMap: { [id: string]: any } = {};
    const configIds: string[] = [];
    configs.forEach((config) => {
      configsMap[config.id] = config;
      configIds.push(config.id);
    });
    return {
      ...state,
      configs: configsMap,
      configIds,
      loading: false,
      error: null,
    };
  }),
  on(DashboardActions.loadDashboardConfigsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(DashboardActions.selectDashboardConfig, (state, { configId }) => ({
    ...state,
    currentConfigId: configId,
  })),
  on(DashboardActions.createDashboardConfig, (state, { config }) => ({
    ...state,
    configs: {
      ...state.configs,
      [config.id]: config,
    },
    configIds: [...state.configIds, config.id],
  })),
  on(DashboardActions.updateDashboardConfig, (state, { config }) => ({
    ...state,
    configs: {
      ...state.configs,
      [config.id]: config,
    },
  })),
  on(DashboardActions.deleteDashboardConfig, (state, { configId }) => {
    const { [configId]: _, ...configs } = state.configs;
    return {
      ...state,
      configs,
      configIds: state.configIds.filter((id) => id !== configId),
      currentConfigId: state.currentConfigId === configId ? null : state.currentConfigId,
    };
  }),
  on(DashboardActions.loadDashboardMetrics, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(DashboardActions.loadDashboardMetricsSuccess, (state, { metrics }) => ({
    ...state,
    metrics,
    loading: false,
    error: null,
  })),
  on(DashboardActions.loadDashboardMetricsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(DashboardActions.updateDashboardMetricsRealtime, (state, { metrics }) => ({
    ...state,
    metrics,
  })),
);
