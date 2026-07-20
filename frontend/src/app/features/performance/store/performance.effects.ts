import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, retry, tap } from 'rxjs/operators';
import * as PerformanceActions from './performance.actions';

/**
 * PerformanceEffects handles side effects for performance metric operations.
 */
@Injectable()
export class PerformanceEffects {
  private actions$ = inject(Actions);

  /**
   * Effect: Load Performance Metrics
   */
  readonly loadPerformanceMetrics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PerformanceActions.loadPerformanceMetrics),
      switchMap(() =>
        of([]).pipe(
          retry({
            count: 3,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000;
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          map((metrics) => PerformanceActions.loadPerformanceMetricsSuccess({ metrics })),
          catchError((error) =>
            of(
              PerformanceActions.loadPerformanceMetricsFailure({
                error: error.message || 'Failed to load performance metrics',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  /**
   * Effect: Update Performance Metric
   */
  readonly updatePerformanceMetric$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PerformanceActions.updatePerformanceMetric),
      switchMap(({ metric }) =>
        of(metric).pipe(
          retry(2),
          tap(() => console.log('[PerformanceEffects] Metric updated successfully')),
          switchMap(() => of(PerformanceActions.loadPerformanceMetrics())),
          catchError((error) =>
            of(
              PerformanceActions.loadPerformanceMetricsFailure({
                error: error.message || 'Failed to update performance metric',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  /**
   * Effect: Add Performance Metric
   */
  readonly addPerformanceMetric$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PerformanceActions.addPerformanceMetric),
      switchMap(({ metric }) =>
        of(metric).pipe(
          retry(2),
          tap(() => console.log('[PerformanceEffects] Metric added successfully')),
          switchMap(() => of(PerformanceActions.loadPerformanceMetrics())),
          catchError((error) =>
            of(
              PerformanceActions.loadPerformanceMetricsFailure({
                error: error.message || 'Failed to add performance metric',
              }),
            ),
          ),
        ),
      ),
    ),
  );

  /**
   * Effect: Delete Performance Metric
   */
  readonly deletePerformanceMetric$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PerformanceActions.deletePerformanceMetric),
      switchMap(({ id }) =>
        of(id).pipe(
          retry(2),
          tap(() => console.log('[PerformanceEffects] Metric deleted successfully')),
          switchMap(() => of(PerformanceActions.loadPerformanceMetrics())),
          catchError((error) =>
            of(
              PerformanceActions.loadPerformanceMetricsFailure({
                error: error.message || 'Failed to delete performance metric',
              }),
            ),
          ),
        ),
      ),
    ),
  );
}
