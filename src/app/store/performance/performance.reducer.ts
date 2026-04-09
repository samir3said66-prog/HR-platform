import { createReducer, on } from '@ngrx/store';
import { PerformanceState, initialPerformanceState } from './performance.state';
import * as PerformanceActions from './performance.actions';

export const performanceReducer = createReducer(
  initialPerformanceState,
  on(PerformanceActions.loadPerformanceMetrics, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PerformanceActions.loadPerformanceMetricsSuccess, (state, { metrics }) => {
    const entities: { [id: string]: any } = {};
    const ids: string[] = [];
    metrics.forEach((metric) => {
      entities[metric.id] = metric;
      ids.push(metric.id);
    });
    return {
      ...state,
      entities,
      ids,
      loading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
    };
  }),
  on(PerformanceActions.loadPerformanceMetricsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(PerformanceActions.updatePerformanceMetric, (state, { metric }) => ({
    ...state,
    entities: {
      ...state.entities,
      [metric.id]: metric,
    },
    lastUpdated: new Date().toISOString(),
  })),
  on(PerformanceActions.addPerformanceMetric, (state, { metric }) => ({
    ...state,
    entities: {
      ...state.entities,
      [metric.id]: metric,
    },
    ids: [...state.ids, metric.id],
    lastUpdated: new Date().toISOString(),
  })),
  on(PerformanceActions.deletePerformanceMetric, (state, { id }) => {
    const { [id]: _, ...entities } = state.entities;
    return {
      ...state,
      entities,
      ids: state.ids.filter((metricId) => metricId !== id),
      lastUpdated: new Date().toISOString(),
    };
  }),
  on(PerformanceActions.updatePerformanceMetricsRealtime, (state, { metrics }) => {
    const entities = { ...state.entities };
    const ids = [...state.ids];
    metrics.forEach((metric) => {
      if (!entities[metric.id]) {
        ids.push(metric.id);
      }
      entities[metric.id] = metric;
    });
    return {
      ...state,
      entities,
      ids,
      lastUpdated: new Date().toISOString(),
    };
  }),
);
