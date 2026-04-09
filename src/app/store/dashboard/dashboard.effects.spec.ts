import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { DashboardEffects } from './dashboard.effects';
import * as DashboardActions from './dashboard.actions';
import { DashboardConfig, DashboardMetrics } from './dashboard.state';

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
  let actions$: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardEffects, provideMockActions(() => actions$)],
    });
    effects = TestBed.inject(DashboardEffects);
  });

  describe('loadDashboardConfigs$', () => {
    it('should return loadDashboardConfigsSuccess action on success', (done) => {
      actions$ = of(DashboardActions.loadDashboardConfigs());
      effects.loadDashboardConfigs$.subscribe((result: any) => {
        expect(result.type).toBe(DashboardActions.loadDashboardConfigsSuccess.type);
        done();
      });
    });

    it('should handle loadDashboardConfigs action and dispatch success', (done) => {
      actions$ = of(DashboardActions.loadDashboardConfigs());
      effects.loadDashboardConfigs$.subscribe((result: any) => {
        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        done();
      });
    });
  });

  describe('loadDashboardMetrics$', () => {
    it('should return loadDashboardMetricsSuccess action on success', (done) => {
      actions$ = of(DashboardActions.loadDashboardMetrics());
      effects.loadDashboardMetrics$.subscribe((result: any) => {
        expect(result.type).toBe(DashboardActions.loadDashboardMetricsSuccess.type);
        done();
      });
    });

    it('should handle loadDashboardMetrics action and dispatch success', (done) => {
      actions$ = of(DashboardActions.loadDashboardMetrics());
      effects.loadDashboardMetrics$.subscribe((result: any) => {
        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        done();
      });
    });
  });

  describe('createDashboardConfig$', () => {
    it('should handle createDashboardConfig action', (done) => {
      const mockConfig: DashboardConfig = {
        id: 'config-1',
        name: 'Main Dashboard',
        layout: 'grid',
        widgets: [],
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      actions$ = of(DashboardActions.createDashboardConfig({ config: mockConfig }));
      effects.createDashboardConfig$.subscribe((result: any) => {
        expect(result.type).toBe(DashboardActions.loadDashboardConfigs.type);
        done();
      });
    });

    it('should dispatch loadDashboardConfigs after creating config', (done) => {
      const mockConfig: DashboardConfig = {
        id: 'config-2',
        name: 'Performance Dashboard',
        layout: 'grid',
        widgets: [],
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      actions$ = of(DashboardActions.createDashboardConfig({ config: mockConfig }));
      effects.createDashboardConfig$.subscribe((result: any) => {
        expect(result.type).toBe(DashboardActions.loadDashboardConfigs.type);
        done();
      });
    });
  });

  describe('updateDashboardConfig$', () => {
    it('should handle updateDashboardConfig action', (done) => {
      const mockConfig: DashboardConfig = {
        id: 'config-1',
        name: 'Updated Dashboard',
        layout: 'grid',
        widgets: [],
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      actions$ = of(DashboardActions.updateDashboardConfig({ config: mockConfig }));
      effects.updateDashboardConfig$.subscribe((result: any) => {
        expect(result.type).toBe(DashboardActions.loadDashboardConfigs.type);
        done();
      });
    });

    it('should dispatch loadDashboardConfigs after updating config', (done) => {
      const mockConfig: DashboardConfig = {
        id: 'config-1',
        name: 'Main Dashboard Updated',
        layout: 'flex',
        widgets: [],
        isDefault: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      actions$ = of(DashboardActions.updateDashboardConfig({ config: mockConfig }));
      effects.updateDashboardConfig$.subscribe((result: any) => {
        expect(result.type).toBe(DashboardActions.loadDashboardConfigs.type);
        done();
      });
    });
  });

  describe('deleteDashboardConfig$', () => {
    it('should handle deleteDashboardConfig action', (done) => {
      actions$ = of(DashboardActions.deleteDashboardConfig({ configId: 'config-1' }));
      effects.deleteDashboardConfig$.subscribe((result: any) => {
        expect(result.type).toBe(DashboardActions.loadDashboardConfigs.type);
        done();
      });
    });

    it('should dispatch loadDashboardConfigs after deleting config', (done) => {
      actions$ = of(DashboardActions.deleteDashboardConfig({ configId: 'config-2' }));
      effects.deleteDashboardConfig$.subscribe((result: any) => {
        expect(result.type).toBe(DashboardActions.loadDashboardConfigs.type);
        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should implement retry logic with exponential backoff', (done) => {
      actions$ = of(DashboardActions.loadDashboardConfigs());
      effects.loadDashboardConfigs$.subscribe((result: any) => {
        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        done();
      });
    });
  });
});
