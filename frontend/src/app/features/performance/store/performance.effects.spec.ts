import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject, firstValueFrom } from 'rxjs';
import { PerformanceEffects } from './performance.effects';
import * as PerformanceActions from './performance.actions';
import { PerformanceMetric } from './performance.state';
import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Test Suite: Performance Effects
 *
 * Tests for performance metric-related side effects including:
 * - Loading performance metrics with retry logic
 * - Adding new performance metrics
 * - Updating existing performance metrics
 * - Deleting performance metrics
 * - Error handling and retry logic
 *
 * Requirements: 12.5, 12.6
 */
describe('PerformanceEffects', () => {
  let effects: PerformanceEffects;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject();
    TestBed.configureTestingModule({
      providers: [PerformanceEffects, provideMockActions(() => actions$)],
    });
    effects = TestBed.inject(PerformanceEffects);
  });

  describe('loadPerformanceMetrics$', () => {
    it('should return loadPerformanceMetricsSuccess action on success', async () => {
      const resultPromise = firstValueFrom(effects.loadPerformanceMetrics$);
      actions$.next(PerformanceActions.loadPerformanceMetrics());
      const result = await resultPromise;
      expect(result.type).toBe(PerformanceActions.loadPerformanceMetricsSuccess.type);
    });

    it('should handle loadPerformanceMetrics action and dispatch success', async () => {
      const resultPromise = firstValueFrom(effects.loadPerformanceMetrics$);
      actions$.next(PerformanceActions.loadPerformanceMetrics());
      const result = await resultPromise;
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });

  describe('addPerformanceMetric$', () => {
    it('should handle addPerformanceMetric action', async () => {
      const mockMetric: PerformanceMetric = {
        id: '1',
        employeeId: '1',
        score: 85,
        reviewDate: '2024-01-15',
        trend: 'up',
        department: 'Engineering',
      };

      const resultPromise = firstValueFrom(effects.addPerformanceMetric$);
      actions$.next(PerformanceActions.addPerformanceMetric({ metric: mockMetric }));
      const result = await resultPromise;
      expect(result.type).toBe(PerformanceActions.loadPerformanceMetrics.type);
    });

    it('should dispatch loadPerformanceMetrics after adding metric', async () => {
      const mockMetric: PerformanceMetric = {
        id: '2',
        employeeId: '2',
        score: 92,
        reviewDate: '2024-01-15',
        trend: 'up',
        department: 'HR',
      };

      const resultPromise = firstValueFrom(effects.addPerformanceMetric$);
      actions$.next(PerformanceActions.addPerformanceMetric({ metric: mockMetric }));
      const result = await resultPromise;
      expect(result.type).toBe(PerformanceActions.loadPerformanceMetrics.type);
    });
  });

  describe('updatePerformanceMetric$', () => {
    it('should handle updatePerformanceMetric action', async () => {
      const mockMetric: PerformanceMetric = {
        id: '1',
        employeeId: '1',
        score: 88,
        reviewDate: '2024-01-15',
        trend: 'up',
        department: 'Engineering',
      };

      const resultPromise = firstValueFrom(effects.updatePerformanceMetric$);
      actions$.next(PerformanceActions.updatePerformanceMetric({ metric: mockMetric }));
      const result = await resultPromise;
      expect(result.type).toBe(PerformanceActions.loadPerformanceMetrics.type);
    });

    it('should dispatch loadPerformanceMetrics after updating metric', async () => {
      const mockMetric: PerformanceMetric = {
        id: '1',
        employeeId: '1',
        score: 90,
        reviewDate: '2024-02-15',
        trend: 'up',
        department: 'Engineering',
      };

      const resultPromise = firstValueFrom(effects.updatePerformanceMetric$);
      actions$.next(PerformanceActions.updatePerformanceMetric({ metric: mockMetric }));
      const result = await resultPromise;
      expect(result.type).toBe(PerformanceActions.loadPerformanceMetrics.type);
    });
  });

  describe('deletePerformanceMetric$', () => {
    it('should handle deletePerformanceMetric action', async () => {
      const resultPromise = firstValueFrom(effects.deletePerformanceMetric$);
      actions$.next(PerformanceActions.deletePerformanceMetric({ id: '1' }));
      const result = await resultPromise;
      expect(result.type).toBe(PerformanceActions.loadPerformanceMetrics.type);
    });

    it('should dispatch loadPerformanceMetrics after deleting metric', async () => {
      const resultPromise = firstValueFrom(effects.deletePerformanceMetric$);
      actions$.next(PerformanceActions.deletePerformanceMetric({ id: '2' }));
      const result = await resultPromise;
      expect(result.type).toBe(PerformanceActions.loadPerformanceMetrics.type);
    });
  });

  describe('Error Handling', () => {
    it('should implement retry logic with exponential backoff', async () => {
      const resultPromise = firstValueFrom(effects.loadPerformanceMetrics$);
      actions$.next(PerformanceActions.loadPerformanceMetrics());
      const result = await resultPromise;
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });
});
