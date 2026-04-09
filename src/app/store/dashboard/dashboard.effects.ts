import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, retry, tap } from 'rxjs/operators';
import * as DashboardActions from './dashboard.actions';

/**
 * DashboardEffects handles side effects for dashboard-related operations.
 * 
 * Effects implemented:
 * - loadDashboardConfigs$: Loads dashboard configurations from API
 * - loadDashboardMetrics$: Loads dashboard metrics from API
 * - createDashboardConfig$: Creates a new dashboard configuration
 * - updateDashboardConfig$: Updates an existing dashboard configuration
 * - deleteDashboardConfig$: Deletes a dashboard configuration
 * 
 * Error Handling Strategy:
 * - Implements retry logic with exponential backoff
 * - Catches errors and dispatches failure actions
 * - Logs errors for debugging and monitoring
 * - Provides sensible defaults on failure
 * 
 * Requirements: 12.5, 12.6
 */
@Injectable()
export class DashboardEffects {
  /**
   * Effect: Load Dashboard Configs
   * 
   * Triggers when loadDashboardConfigs action is dispatched.
   * Fetches dashboard configurations from API with retry logic.
   * 
   * Success: Dispatches loadDashboardConfigsSuccess with configs data
   * Failure: Dispatches loadDashboardConfigsFailure with error message
   * 
   * Retry Strategy: 3 attempts with exponential backoff
   */
  loadDashboardConfigs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboardConfigs),
      switchMap(() =>
        // TODO: Replace with actual API call
        // Example: this.dashboardService.getDashboardConfigs()
        of([]).pipe(
          retry({
            count: 3,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
              console.warn(
                `[DashboardEffects] Retry load configs attempt ${retryCount + 1} after ${delayMs}ms`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          map((configs) => DashboardActions.loadDashboardConfigsSuccess({ configs })),
          catchError((error) => {
            console.error('[DashboardEffects] Failed to load dashboard configs after retries:', error);
            return of(
              DashboardActions.loadDashboardConfigsFailure({
                error: error.message || 'Failed to load dashboard configurations',
              }),
            );
          }),
        ),
      ),
    ),
  );

  /**
   * Effect: Load Dashboard Metrics
   * 
   * Triggers when loadDashboardMetrics action is dispatched.
   * Fetches dashboard metrics from API with retry logic.
   * 
   * Success: Dispatches loadDashboardMetricsSuccess with metrics data
   * Failure: Dispatches loadDashboardMetricsFailure with error message
   * 
   * Retry Strategy: 3 attempts with exponential backoff
   */
  loadDashboardMetrics$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboardMetrics),
      switchMap(() => {
        // TODO: Replace with actual API call
        // Example: this.dashboardService.getDashboardMetrics()
        const defaultMetrics = {
          totalHeadcount: 0,
          activeEmployees: 0,
          onLeave: 0,
          newHires: 0,
          departures: 0,
          lastUpdated: new Date().toISOString(),
        };
        return of(defaultMetrics).pipe(
          retry({
            count: 3,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
              console.warn(
                `[DashboardEffects] Retry load metrics attempt ${retryCount + 1} after ${delayMs}ms`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          map((metrics) => DashboardActions.loadDashboardMetricsSuccess({ metrics })),
          catchError((error) => {
            console.error('[DashboardEffects] Failed to load dashboard metrics after retries:', error);
            return of(
              DashboardActions.loadDashboardMetricsFailure({
                error: error.message || 'Failed to load dashboard metrics',
              }),
            );
          }),
        );
      }),
    ),
  );

  /**
   * Effect: Create Dashboard Config
   * 
   * Triggers when createDashboardConfig action is dispatched.
   * Sends new dashboard configuration to API.
   * 
   * Success: Dispatches loadDashboardConfigs to refresh the list
   * Failure: Dispatches loadDashboardConfigsFailure with error message
   * 
   * Retry Strategy: 2 attempts with exponential backoff
   */
  createDashboardConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.createDashboardConfig),
      switchMap(({ config }) =>
        // TODO: Replace with actual API call
        // Example: this.dashboardService.createConfig(config)
        of(config).pipe(
          retry({
            count: 2,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.warn(
                `[DashboardEffects] Retry create config attempt ${retryCount + 1}`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          tap(() => console.log('[DashboardEffects] Dashboard config created successfully')),
          switchMap(() => of(DashboardActions.loadDashboardConfigs())),
          catchError((error) => {
            console.error('[DashboardEffects] Failed to create dashboard config:', error);
            return of(
              DashboardActions.loadDashboardConfigsFailure({
                error: error.message || 'Failed to create dashboard configuration',
              }),
            );
          }),
        ),
      ),
    ),
  );

  /**
   * Effect: Update Dashboard Config
   * 
   * Triggers when updateDashboardConfig action is dispatched.
   * Sends updated dashboard configuration to API.
   * 
   * Success: Dispatches loadDashboardConfigs to refresh the list
   * Failure: Dispatches loadDashboardConfigsFailure with error message
   * 
   * Retry Strategy: 2 attempts with exponential backoff
   */
  updateDashboardConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.updateDashboardConfig),
      switchMap(({ config }) =>
        // TODO: Replace with actual API call
        // Example: this.dashboardService.updateConfig(config)
        of(config).pipe(
          retry({
            count: 2,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.warn(
                `[DashboardEffects] Retry update config attempt ${retryCount + 1}`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          tap(() => console.log('[DashboardEffects] Dashboard config updated successfully')),
          switchMap(() => of(DashboardActions.loadDashboardConfigs())),
          catchError((error) => {
            console.error('[DashboardEffects] Failed to update dashboard config:', error);
            return of(
              DashboardActions.loadDashboardConfigsFailure({
                error: error.message || 'Failed to update dashboard configuration',
              }),
            );
          }),
        ),
      ),
    ),
  );

  /**
   * Effect: Delete Dashboard Config
   * 
   * Triggers when deleteDashboardConfig action is dispatched.
   * Sends delete request to API.
   * 
   * Success: Dispatches loadDashboardConfigs to refresh the list
   * Failure: Dispatches loadDashboardConfigsFailure with error message
   * 
   * Retry Strategy: 2 attempts with exponential backoff
   */
  deleteDashboardConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.deleteDashboardConfig),
      switchMap(({ configId }) =>
        // TODO: Replace with actual API call
        // Example: this.dashboardService.deleteConfig(configId)
        of(configId).pipe(
          retry({
            count: 2,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.warn(
                `[DashboardEffects] Retry delete config attempt ${retryCount + 1}`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          tap(() => console.log('[DashboardEffects] Dashboard config deleted successfully')),
          switchMap(() => of(DashboardActions.loadDashboardConfigs())),
          catchError((error) => {
            console.error('[DashboardEffects] Failed to delete dashboard config:', error);
            return of(
              DashboardActions.loadDashboardConfigsFailure({
                error: error.message || 'Failed to delete dashboard configuration',
              }),
            );
          }),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions) {}
}
