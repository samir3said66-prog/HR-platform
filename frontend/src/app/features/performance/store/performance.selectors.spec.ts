import { createSelector } from '@ngrx/store';
import {
  selectAllPerformanceMetrics,
  selectPerformanceMetricIds,
  selectPerformanceMetricEntities,
  selectPerformanceLoading,
  selectPerformanceError,
  selectPerformanceLastUpdated,
  selectPerformanceMetricById,
  selectPerformanceMetricsByEmployeeId,
  selectPerformanceMetricsByDepartment,
  selectAveragePerformanceScore,
  selectPerformanceDistribution,
} from './performance.selectors';
import { PerformanceState } from './performance.state';
import { describe, it, expect } from 'vitest';

/**
 * Unit Tests: Performance Selectors
 * Requirements: 2.1, 28.1
 */

const mockState: PerformanceState = {
  ids: ['m1', 'm2', 'm3'],
  entities: {
    m1: { id: 'm1', employeeId: 'emp-1', score: 85, reviewDate: '2023-01-01', trend: 'up', department: 'Sales' },
    m2: { id: 'm2', employeeId: 'emp-2', score: 45, reviewDate: '2023-02-01', trend: 'stable', department: 'Engineering' },
    m3: { id: 'm3', employeeId: 'emp-1', score: 95, reviewDate: '2023-03-01', trend: 'up', department: 'Sales' },
  },
  loading: false,
  error: null,
  lastUpdated: '2023-11-01',
};

const mockRootState = { performance: mockState };

describe('Performance Selectors', () => {
  describe('selectAllPerformanceMetrics', () => {
    it('should return all metrics as an array in order of ids', () => {
      const result = selectAllPerformanceMetrics(mockRootState as any);
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('m1');
    });
  });

  describe('selectPerformanceMetricIds', () => {
    it('should return array of metric ids', () => {
      const result = selectPerformanceMetricIds(mockRootState as any);
      expect(result).toEqual(['m1', 'm2', 'm3']);
    });
  });

  describe('selectPerformanceMetricEntities', () => {
    it('should return metrics dictionary', () => {
      const result = selectPerformanceMetricEntities(mockRootState as any);
      expect(result['m1'].score).toBe(85);
    });
  });

  describe('selectPerformanceLoading', () => {
    it('should return loading status', () => {
      expect(selectPerformanceLoading(mockRootState as any)).toBe(false);
    });
  });

  describe('selectPerformanceError', () => {
    it('should return error status', () => {
      expect(selectPerformanceError(mockRootState as any)).toBeNull();
    });
  });

  describe('selectPerformanceLastUpdated', () => {
    it('should return last updated timestamp', () => {
      expect(selectPerformanceLastUpdated(mockRootState as any)).toBe('2023-11-01');
    });
  });

  describe('selectPerformanceMetricById', () => {
    it('should return specific metric object', () => {
      const selector = selectPerformanceMetricById('m2');
      const result = selector(mockRootState as any);
      expect(result?.department).toBe('Engineering');
    });

    it('should return undefined for missing metric', () => {
      const selector = selectPerformanceMetricById('invalid');
      const result = selector(mockRootState as any);
      expect(result).toBeUndefined();
    });
  });

  describe('selectPerformanceMetricsByEmployeeId', () => {
    it('should filter metrics for a specific employee', () => {
      const selector = selectPerformanceMetricsByEmployeeId('emp-1');
      const result = selector(mockRootState as any);
      expect(result).toHaveLength(2);
      expect(result.every((m) => m.employeeId === 'emp-1')).toBe(true);
    });
  });

  describe('selectPerformanceMetricsByDepartment', () => {
    it('should filter metrics by department', () => {
      const selector = selectPerformanceMetricsByDepartment('Sales');
      const result = selector(mockRootState as any);
      expect(result).toHaveLength(2);
      expect(result.every((m) => m.department === 'Sales')).toBe(true);
    });
  });

  describe('selectAveragePerformanceScore', () => {
    it('should calculate the average score across all metrics', () => {
      // (85 + 45 + 95) / 3 = 75
      const result = selectAveragePerformanceScore(mockRootState as any);
      expect(result).toBe(75);
    });

    it('should return 0 when no metrics exist', () => {
      const emptyState = { performance: { ...mockState, ids: [], entities: {} } };
      const result = selectAveragePerformanceScore(emptyState as any);
      expect(result).toBe(0);
    });
  });

  describe('selectPerformanceDistribution', () => {
    it('should bucket performance scores accurately', () => {
      const result = selectPerformanceDistribution(mockRootState as any);
      // excellent: >= 80 -> m1 (85), m3 (95) => 2
      // good: >= 60-79 -> 0
      // average: >= 40-59 -> m2 (45) => 1
      // poor: < 40 -> 0
      expect(result.excellent).toBe(2);
      expect(result.good).toBe(0);
      expect(result.average).toBe(1);
      expect(result.poor).toBe(0);
    });
  });
});
