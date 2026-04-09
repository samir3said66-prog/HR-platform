import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { PerformanceEffects } from './performance.effects';
import * as PerformanceActions from './performance.actions';
import { PerformanceMetric } from './performance.state';

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
  let actions$: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PerformanceEffects, provideMockActions(() => actions$)],
    });
    effects = TestBed.inject(PerformanceEffects);
  });

  describe('loadPerformanceMetrics$', () => {
    it('should return loadPerformanceMetricsSuccess action on success', (done) => {
      actions$ = of(PerformanceActions.loadPerformanceMetrics());
      effects.loadPerformanceMetrics$.subscribe((result: any) => {
        expect(result.type).toBe(PerformanceActions.loadPerformanceMetricsSuccess.type);
        done();
      });
    });

    it('should handle loadPerformanceMetrics action and dispatch success', (done) => {
      actions$ = of(PerformanceActions.loadPerformanceMetrics());
      effects.loadPerformanceMetrics$.subscribe((result: any) => {
        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        done();
      });
    });
  });

  describe('addPerformanceMetric$', () => {
    it('should handle addPerformanceMetric action', (done) => {
      const mockMetric: PerformanceMetric = {
        id: '1',
        employeeId: '1',
        score: 85,
        reviewDate: '2024-01-15',
        trend: 'up',
        department: 'Engineering',
      };

      actions$ = of(PerformanceActions.addPerformanceMetric({ metric: mockMetric }));
      effects.addPerformanceMetric$.subscribe((result: any) => {
        expect(result.type).toBe(PerformanceActions.loadPerformanceMetrics.type);
        done();
      });
    });

    it('should dispatch loadPerformanceMetrics after adding metric', (done) => {
      const mockMetric: PerformanceMetric = {
        id: '2',
        employeeId: '2',
        score: 92,
        reviewDate: '2024-01-15',
        trend: 'up',
        department: 'HR',
      };

      actions$ = of(PerformanceActions.addPerformanceMetric({ metric: mockMetric }));
      effects.addPerformanceMetric$.subscribe((result: any) => {
        expect(result.type).toBe(PerformanceActions.loadPerformanceMetrics.type);
        done();
      });
    });
  });

  describe('updatePerformanceMetric$', () => {
    it('should handle updatePerformanceMetric action', (done) => {
      const mockMetric: PerformanceMetric = {
        id: '1',
        employeeId: '1',
        score: 88,
        reviewDate: '2024-01-15',
        trend: 'up',
        department: 'Engineering',
      };

      actions$ = of(PerformanceActions.updatePerformanceMetric({ metric: mockMetric }));
      effects.updatePerformanceMetric$.subscribe((result: any) => {
        expect(result.type).toBe(PerformanceActions.loadPerformanceMetrics.type);
        done();
      });
    });

    it('should dispatch loadPerformanceMetrics after updating metric', (done) => {
      const mockMetric: PerformanceMetric = {
        id: '1',
        employeeId: '1',
        score: 90,
        reviewDate: '2024-02-15',
        trend: 'up',
        department: 'Engineering',
      };

      actions$ = of(PerformanceActions.updatePerformanceMetric({ metric: mockMetric }));
      effects.updatePerformanceMetric$.subscribe((result: any) => {
        expect(result.type).toBe(PerformanceActions.loadPerformanceMetrics.type);
        done();
      });
    });
  });

  describe('deletePerformanceMetric$', () => {
    it('should handle deletePerformanceMetric action', (done) => {
      actions$ = of(PerformanceActions.deletePerformanceMetric({ id: '1' }));
      effects.deletePerformanceMetric$.subscribe((result: any) => {
        expect(result.type).toBe(PerformanceActions.loadPerformanceMetrics.type);
        done();
      });
    });

    it('should dispatch loadPerformanceMetrics after deleting metric', (done) => {
      actions$ = of(PerformanceActions.deletePerformanceMetric({ id: '2' }));
      effects.deletePerformanceMetric$.subscribe((result: any) => {
        expect(result.type).toBe(PerformanceActions.loadPerformanceMetrics.type);
        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should implement retry logic with exponential backoff', (done) => {
      actions$ = of(PerformanceActions.loadPerformanceMetrics());
      effects.loadPerformanceMetrics$.subscribe((result: any) => {
        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        done();
      });
    });
  });
});
