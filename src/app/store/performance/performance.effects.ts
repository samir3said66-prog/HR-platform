import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, retry, tap } from 'rxjs/operators';
import * as PerformanceActions from './performance.actions';

/**
 * PerformanceEffects handles side effects for performance metric operations.
 * 
 * Effects implemented:
 * - loadPerformanceMetrics$: Loads performance metrics from API with retry logic
 * - updatePerformanceMetric$: Updates a single performance metric
 * - addPerformanceMetric$: Adds a new performance metric
 * - deletePerformanceMetric$: Deletes a performance metric
 * 
 * Error Handling Strategy:
 * - Implements retry logic with exponential backoff
 * - Catches errors and dispatches failure actions
 * - Logs errors for debugging and monitoring
 * 
 * Requirements: 12.5, 12.6
 */
@Injectable()
export class PerformanceEffects {
  /**
   * Effect: Load Performance Metrics
   * 
   * Triggers when loadPerformanceMetrics action is dispatched.
   * Fetches performance metrics from API with retry logic.
   * 
   * Success: Dispatches loadPerformanceMetricsSuccess with metrics data
   * Failure: Dispatches loadPerformanceMetricsFailure with error message
   * 
   * Retry Strategy: 3 attempts with exponential backoff
   */
  loadPerformanceMetrics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PerformanceActions.loadPerformanceMetrics),
      switchMap(() =>
        // TODO: Replace with actual API call
        // Example: this.performanceService.getMetrics()
        of([]).pipe(
          retry({
            count: 3,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
              console.warn(
                `[PerformanceEffects] Retry attempt ${retryCount + 1} after ${delayMs}ms`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          map((metrics) => PerformanceActions.loadPerformanceMetricsSuccess({ metrics })),
          catchError((error) => {
            console.error('[PerformanceEffects] Failed to load metrics after retries:', error);
            return of(
              PerformanceActions.loadPerformanceMetricsFailure({
                error: error.message || 'Failed to load performance metrics',
              }),
            );
          }),
        ),
      ),
    ),
  );

  /**
   * Effect: Update Performance Metric
   * 
   * Triggers when updatePerformanceMetric action is dispatched.
   * Sends updated metric data to API.
   * 
   * Success: Dispatches loadPerformanceMetrics to refresh the list
   * Failure: Dispatches loadPerformanceMetricsFailure with error message
   * 
   * Retry Strategy: 2 attempts with exponential backoff
   */
  updatePerformanceMetric$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PerformanceActions.updatePerformanceMetric),
      switchMap(({ metric }) =>
        // TODO: Replace with actual API call
        // Example: this.performanceService.updateMetric(metric)
        of(metric).pipe(
          retry({
            count: 2,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.warn(
                `[PerformanceEffects] Retry update metric attempt ${retryCount + 1}`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          tap(() => console.log('[PerformanceEffects] Metric updated successfully')),
          switchMap(() => of(PerformanceActions.loadPerformanceMetrics())),
          catchError((error) => {
            console.error('[PerformanceEffects] Failed to update metric:', error);
            return of(
              PerformanceActions.loadPerformanceMetricsFailure({
                error: error.message || 'Failed to update performance metric',
              }),
            );
          }),
        ),
      ),
    ),
  );

  /**
   * Effect: Add Performance Metric
   * 
   * Triggers when addPerformanceMetric action is dispatched.
   * Sends new metric data to API.
   * 
   * Success: Dispatches loadPerformanceMetrics to refresh the list
   * Failure: Dispatches loadPerformanceMetricsFailure with error message
   * 
   * Retry Strategy: 2 attempts with exponential backoff
   */
  addPerformanceMetric$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PerformanceActions.addPerformanceMetric),
      switchMap(({ metric }) =>
        // TODO: Replace with actual API call
        // Example: this.performanceService.addMetric(metric)
        of(metric).pipe(
          retry({
            count: 2,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.warn(
                `[PerformanceEffects] Retry add metric attempt ${retryCount + 1}`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          tap(() => console.log('[PerformanceEffects] Metric added successfully')),
          switchMap(() => of(PerformanceActions.loadPerformanceMetrics())),
          catchError((error) => {
            console.error('[PerformanceEffects] Failed to add metric:', error);
            return of(
              PerformanceActions.loadPerformanceMetricsFailure({
                error: error.message || 'Failed to add performance metric',
              }),
            );
          }),
        ),
      ),
    ),
  );

  /**
   * Effect: Delete Performance Metric
   * 
   * Triggers when deletePerformanceMetric action is dispatched.
   * Sends delete request to API.
   * 
   * Success: Dispatches loadPerformanceMetrics to refresh the list
   * Failure: Dispatches loadPerformanceMetricsFailure with error message
   * 
   * Retry Strategy: 2 attempts with exponential backoff
   */
  deletePerformanceMetric$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PerformanceActions.deletePerformanceMetric),
      switchMap(({ id }) =>
        // TODO: Replace with actual API call
        // Example: this.performanceService.deleteMetric(id)
        of(id).pipe(
          retry({
            count: 2,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.warn(
                `[PerformanceEffects] Retry delete metric attempt ${retryCount + 1}`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          tap(() => console.log('[PerformanceEffects] Metric deleted successfully')),
          switchMap(() => of(PerformanceActions.loadPerformanceMetrics())),
          catchError((error) => {
            console.error('[PerformanceEffects] Failed to delete metric:', error);
            return of(
              PerformanceActions.loadPerformanceMetricsFailure({
                error: error.message || 'Failed to delete performance metric',
              }),
            );
          }),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions) {}
}
