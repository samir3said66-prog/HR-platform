import { performanceReducer } from './performance.reducer';
import { initialPerformanceState, PerformanceMetric } from './performance.state';
import * as PerformanceActions from './performance.actions';
import { describe, it, expect } from 'vitest';

/**
 * Unit Tests: Performance Reducer
 * Requirements: 2.1, 28.1
 */

const mockMetrics: PerformanceMetric[] = [
  {
    id: 'm1',
    employeeId: 'emp-1',
    score: 85,
    reviewDate: '2023-01-01',
    trend: 'up',
    department: 'Sales',
  },
  {
    id: 'm2',
    employeeId: 'emp-2',
    score: 92,
    reviewDate: '2023-02-01',
    trend: 'stable',
    department: 'Engineering',
  },
];

describe('performanceReducer', () => {
  it('should return initial state by default', () => {
    const state = performanceReducer(undefined, { type: '@@INIT' } as any);
    expect(state).toEqual(initialPerformanceState);
  });

  describe('loadPerformanceMetrics', () => {
    it('should set loading to true', () => {
      const state = performanceReducer(
        { ...initialPerformanceState, error: 'prev' },
        PerformanceActions.loadPerformanceMetrics()
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('loadPerformanceMetricsSuccess', () => {
    it('should populate entities and ids', () => {
      const state = performanceReducer(
        { ...initialPerformanceState, loading: true },
        PerformanceActions.loadPerformanceMetricsSuccess({ metrics: mockMetrics })
      );
      expect(state.loading).toBe(false);
      expect(state.ids).toEqual(['m1', 'm2']);
      expect(state.entities['m1']).toEqual(mockMetrics[0]);
    });
  });

  describe('loadPerformanceMetricsFailure', () => {
    it('should set error state', () => {
      const state = performanceReducer(
        { ...initialPerformanceState, loading: true },
        PerformanceActions.loadPerformanceMetricsFailure({ error: 'Data fetch failed' })
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Data fetch failed');
    });
  });

  describe('updatePerformanceMetric', () => {
    it('should update an existing metric', () => {
      const initialState = performanceReducer(
        initialPerformanceState,
        PerformanceActions.loadPerformanceMetricsSuccess({ metrics: mockMetrics })
      );

      const update = { ...mockMetrics[0], score: 99 };
      const state = performanceReducer(
        initialState,
        PerformanceActions.updatePerformanceMetric({ metric: update })
      );

      expect(state.entities['m1'].score).toBe(99);
      expect(state.ids).toEqual(['m1', 'm2']);
    });
  });

  describe('addPerformanceMetric', () => {
    it('should append a new metric', () => {
      const newMetric: PerformanceMetric = {
        id: 'm3', employeeId: 'emp-3', score: 70, reviewDate: '2023-03-01', trend: 'down', department: 'HR'
      };

      const state = performanceReducer(
        initialPerformanceState,
        PerformanceActions.addPerformanceMetric({ metric: newMetric })
      );

      expect(state.ids).toContain('m3');
      expect(state.entities['m3'].score).toBe(70);
    });
  });

  describe('deletePerformanceMetric', () => {
    it('should remove a metric by id', () => {
      const initialState = performanceReducer(
        initialPerformanceState,
        PerformanceActions.loadPerformanceMetricsSuccess({ metrics: mockMetrics })
      );

      const state = performanceReducer(
        initialState,
        PerformanceActions.deletePerformanceMetric({ id: 'm1' })
      );

      expect(state.ids).not.toContain('m1');
      expect(state.entities['m1']).toBeUndefined();
    });
  });

  describe('updatePerformanceMetricsRealtime', () => {
    it('should add or update metrics in real-time batch', () => {
      const initialState = performanceReducer(
        initialPerformanceState,
        PerformanceActions.loadPerformanceMetricsSuccess({ metrics: mockMetrics })
      );

      const realtimeUpdate = [
        { ...mockMetrics[0], score: 88 }, // update
        { id: 'm4', employeeId: 'emp-4', score: 60, reviewDate: '2023-04-01', trend: 'up', department: 'IT' } as PerformanceMetric // add
      ];

      const state = performanceReducer(
        initialState,
        PerformanceActions.updatePerformanceMetricsRealtime({ metrics: realtimeUpdate })
      );

      expect(state.entities['m1'].score).toBe(88);
      expect(state.ids).toContain('m4');
      expect(state.entities['m4'].score).toBe(60);
    });
  });
});
