import { createAction, props } from '@ngrx/store';
import { PerformanceMetric } from './performance.state';

export const loadPerformanceMetrics = createAction('[Performance] Load Performance Metrics');

export const loadPerformanceMetricsSuccess = createAction(
  '[Performance] Load Performance Metrics Success',
  props<{ metrics: PerformanceMetric[] }>(),
);

export const loadPerformanceMetricsFailure = createAction(
  '[Performance] Load Performance Metrics Failure',
  props<{ error: string }>(),
);

export const updatePerformanceMetric = createAction(
  '[Performance] Update Performance Metric',
  props<{ metric: PerformanceMetric }>(),
);

export const addPerformanceMetric = createAction(
  '[Performance] Add Performance Metric',
  props<{ metric: PerformanceMetric }>(),
);

export const deletePerformanceMetric = createAction(
  '[Performance] Delete Performance Metric',
  props<{ id: string }>(),
);

export const updatePerformanceMetricsRealtime = createAction(
  '[Performance] Update Performance Metrics Realtime',
  props<{ metrics: PerformanceMetric[] }>(),
);
