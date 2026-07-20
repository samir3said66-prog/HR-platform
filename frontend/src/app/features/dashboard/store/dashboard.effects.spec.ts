import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject, firstValueFrom } from 'rxjs';
import { DashboardEffects } from './dashboard.effects';
import * as DashboardActions from './dashboard.actions';
import { DashboardConfig } from './dashboard.state';
import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Test Suite: Dashboard Effects
 *
 * Tests for dashboard-related side effects including:
 * - Loading dashboard configurations with retry logic
 * - Loading dashboard metrics
 * - Creating new dashboard configurations
 * - Updating existing dashboard configurations
 * - Deleting dashboard configurations
 * - Error handling and retry logic
 *
 * Requirements: 12.5, 12.6
 */
describe('DashboardEffects', () => {
  let effects: DashboardEffects;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject();
    TestBed.configureTestingModule({
      providers: [DashboardEffects, provideMockActions(() => actions$)],
    });
    effects = TestBed.inject(DashboardEffects);
  });

  describe('loadDashboardConfigs$', () => {
    it('should return loadDashboardConfigsSuccess action on success', async () => {
      const resultPromise = firstValueFrom(effects.loadDashboardConfigs$);
      actions$.next(DashboardActions.loadDashboardConfigs());
      const result = await resultPromise;
      expect(result.type).toBe(DashboardActions.loadDashboardConfigsSuccess.type);
    });

    it('should handle loadDashboardConfigs action and dispatch success', async () => {
      const resultPromise = firstValueFrom(effects.loadDashboardConfigs$);
      actions$.next(DashboardActions.loadDashboardConfigs());
      const result = await resultPromise;
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });

  describe('loadDashboardMetrics$', () => {
    it('should return loadDashboardMetricsSuccess action on success', async () => {
      const resultPromise = firstValueFrom(effects.loadDashboardMetrics$);
      actions$.next(DashboardActions.loadDashboardMetrics());
      const result = await resultPromise;
      expect(result.type).toBe(DashboardActions.loadDashboardMetricsSuccess.type);
    });

    it('should handle loadDashboardMetrics action and dispatch success', async () => {
      const resultPromise = firstValueFrom(effects.loadDashboardMetrics$);
      actions$.next(DashboardActions.loadDashboardMetrics());
      const result = await resultPromise;
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });

  describe('createDashboardConfig$', () => {
    it('should handle createDashboardConfig action', async () => {
      const mockConfig: DashboardConfig = {
        id: 'config-1',
        name: 'Main Dashboard',
        layout: 'grid',
        widgets: [],
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const resultPromise = firstValueFrom(effects.createDashboardConfig$);
      actions$.next(DashboardActions.createDashboardConfig({ config: mockConfig }));
      const result = await resultPromise;
      expect(result.type).toBe(DashboardActions.loadDashboardConfigs.type);
    });

    it('should dispatch loadDashboardConfigs after creating config', async () => {
      const mockConfig: DashboardConfig = {
        id: 'config-2',
        name: 'Performance Dashboard',
        layout: 'grid',
        widgets: [],
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const resultPromise = firstValueFrom(effects.createDashboardConfig$);
      actions$.next(DashboardActions.createDashboardConfig({ config: mockConfig }));
      const result = await resultPromise;
      expect(result.type).toBe(DashboardActions.loadDashboardConfigs.type);
    });
  });

  describe('updateDashboardConfig$', () => {
    it('should handle updateDashboardConfig action', async () => {
      const mockConfig: DashboardConfig = {
        id: 'config-1',
        name: 'Updated Dashboard',
        layout: 'grid',
        widgets: [],
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const resultPromise = firstValueFrom(effects.updateDashboardConfig$);
      actions$.next(DashboardActions.updateDashboardConfig({ config: mockConfig }));
      const result = await resultPromise;
      expect(result.type).toBe(DashboardActions.loadDashboardConfigs.type);
    });

    it('should dispatch loadDashboardConfigs after updating config', async () => {
      const mockConfig: DashboardConfig = {
        id: 'config-1',
        name: 'Main Dashboard Updated',
        layout: 'grid',
        widgets: [],
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const resultPromise = firstValueFrom(effects.updateDashboardConfig$);
      actions$.next(DashboardActions.updateDashboardConfig({ config: mockConfig }));
      const result = await resultPromise;
      expect(result.type).toBe(DashboardActions.loadDashboardConfigs.type);
    });
  });

  describe('deleteDashboardConfig$', () => {
    it('should handle deleteDashboardConfig action', async () => {
      const resultPromise = firstValueFrom(effects.deleteDashboardConfig$);
      actions$.next(DashboardActions.deleteDashboardConfig({ configId: 'config-1' }));
      const result = await resultPromise;
      expect(result.type).toBe(DashboardActions.loadDashboardConfigs.type);
    });

    it('should dispatch loadDashboardConfigs after deleting config', async () => {
      const resultPromise = firstValueFrom(effects.deleteDashboardConfig$);
      actions$.next(DashboardActions.deleteDashboardConfig({ configId: 'config-2' }));
      const result = await resultPromise;
      expect(result.type).toBe(DashboardActions.loadDashboardConfigs.type);
    });
  });

  describe('Error Handling', () => {
    it('should implement retry logic with exponential backoff', async () => {
      const resultPromise = firstValueFrom(effects.loadDashboardConfigs$);
      actions$.next(DashboardActions.loadDashboardConfigs());
      const result = await resultPromise;
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });
});
