import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PerformanceState } from './performance.state';

export const selectPerformanceState = createFeatureSelector<PerformanceState>('performance');

export const selectAllPerformanceMetrics = createSelector(selectPerformanceState, (state) =>
  state.ids.map((id) => state.entities[id]),
);

export const selectPerformanceMetricIds = createSelector(
  selectPerformanceState,
  (state) => state.ids,
);

export const selectPerformanceMetricEntities = createSelector(
  selectPerformanceState,
  (state) => state.entities,
);

export const selectPerformanceLoading = createSelector(
  selectPerformanceState,
  (state) => state.loading,
);

export const selectPerformanceError = createSelector(
  selectPerformanceState,
  (state) => state.error,
);

export const selectPerformanceLastUpdated = createSelector(
  selectPerformanceState,
  (state) => state.lastUpdated,
);

export const selectPerformanceMetricById = (id: string) =>
  createSelector(selectPerformanceMetricEntities, (entities) => entities[id]);

export const selectPerformanceMetricsByEmployeeId = (employeeId: string) =>
  createSelector(selectAllPerformanceMetrics, (metrics) =>
    metrics.filter((m) => m.employeeId === employeeId),
  );

export const selectPerformanceMetricsByDepartment = (department: string) =>
  createSelector(selectAllPerformanceMetrics, (metrics) =>
    metrics.filter((m) => m.department === department),
  );

export const selectAveragePerformanceScore = createSelector(
  selectAllPerformanceMetrics,
  (metrics) => {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.score, 0);
    return sum / metrics.length;
  },
);

export const selectPerformanceDistribution = createSelector(
  selectAllPerformanceMetrics,
  (metrics) => {
    const distribution = {
      excellent: 0,
      good: 0,
      average: 0,
      poor: 0,
    };
    metrics.forEach((m) => {
      if (m.score >= 80) distribution.excellent++;
      else if (m.score >= 60) distribution.good++;
      else if (m.score >= 40) distribution.average++;
      else distribution.poor++;
    });
    return distribution;
  },
);
