import { dashboardReducer } from './dashboard.reducer';
import { initialDashboardState, DashboardConfig, DashboardMetrics } from './dashboard.state';
import * as DashboardActions from './dashboard.actions';
import { describe, it, expect } from 'vitest';

/**
 * Unit Tests: Dashboard Reducer
 * Requirements: 12.5, 12.6, 28.1
 */

const mockMetrics: DashboardMetrics = {
  totalHeadcount: 12000,
  activeEmployees: 11800,
  onLeave: 150,
  newHires: 45,
  departures: 12,
  lastUpdated: new Date().toISOString(),
};

const mockConfig: DashboardConfig = {
  id: 'config-1',
  name: 'Global Executive View',
  layout: 'grid',
  isDefault: true,
  widgets: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('dashboardReducer', () => {
  it('should return initial state by default', () => {
    const state = dashboardReducer(undefined, { type: '@@INIT' } as any);
    expect(state).toEqual(initialDashboardState);
  });

  describe('loadDashboardConfigs', () => {
    it('should set loading to true and clear error', () => {
      const state = dashboardReducer(
        { ...initialDashboardState, error: 'past error' },
        DashboardActions.loadDashboardConfigs(),
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('loadDashboardConfigsSuccess', () => {
    it('should populate configs map and ids', () => {
      const state = dashboardReducer(
        { ...initialDashboardState, loading: true },
        DashboardActions.loadDashboardConfigsSuccess({ configs: [mockConfig] }),
      );
      expect(state.loading).toBe(false);
      expect(state.configIds).toEqual(['config-1']);
      expect(state.configs['config-1']).toEqual(mockConfig);
    });
  });

  describe('selectDashboardConfig', () => {
    it('should set currentConfigId', () => {
      const state = dashboardReducer(
        initialDashboardState,
        DashboardActions.selectDashboardConfig({ configId: 'config-2' }),
      );
      expect(state.currentConfigId).toBe('config-2');
    });
  });

  describe('createDashboardConfig', () => {
    it('should add config to map and ids', () => {
      const state = dashboardReducer(
        initialDashboardState,
        DashboardActions.createDashboardConfig({ config: mockConfig }),
      );
      expect(state.configIds).toContain('config-1');
      expect(state.configs['config-1']).toEqual(mockConfig);
    });
  });

  describe('updateDashboardConfig', () => {
    it('should update existing config in map without changing ids', () => {
      const initial = dashboardReducer(
        initialDashboardState,
        DashboardActions.createDashboardConfig({ config: mockConfig }),
      );
      
      const updatedConfig = { ...mockConfig, name: 'Updated Name' };
      const state = dashboardReducer(
        initial,
        DashboardActions.updateDashboardConfig({ config: updatedConfig }),
      );
      
      expect(state.configs['config-1'].name).toBe('Updated Name');
      expect(state.configIds).toHaveLength(1);
    });
  });

  describe('deleteDashboardConfig', () => {
    it('should remove config and clear currentConfigId if it was selected', () => {
      let state = dashboardReducer(
        initialDashboardState,
        DashboardActions.createDashboardConfig({ config: mockConfig }),
      );
      state = dashboardReducer(
        state,
        DashboardActions.selectDashboardConfig({ configId: 'config-1' }),
      );
      
      state = dashboardReducer(
        state,
        DashboardActions.deleteDashboardConfig({ configId: 'config-1' }),
      );
      
      expect(state.configs['config-1']).toBeUndefined();
      expect(state.configIds).not.toContain('config-1');
      expect(state.currentConfigId).toBeNull();
    });
  });

  describe('loadDashboardMetrics', () => {
    it('should set loading to true', () => {
      const state = dashboardReducer(
        initialDashboardState,
        DashboardActions.loadDashboardMetrics(),
      );
      expect(state.loading).toBe(true);
    });
  });

  describe('loadDashboardMetricsSuccess', () => {
    it('should set metrics and clear loading flag', () => {
      const state = dashboardReducer(
        { ...initialDashboardState, loading: true },
        DashboardActions.loadDashboardMetricsSuccess({ metrics: mockMetrics }),
      );
      expect(state.loading).toBe(false);
      expect(state.metrics).toEqual(mockMetrics);
    });
  });

  describe('updateDashboardMetricsRealtime', () => {
    it('should update metrics without affecting loading state', () => {
      const state = dashboardReducer(
        { ...initialDashboardState, loading: false },
        DashboardActions.updateDashboardMetricsRealtime({ metrics: mockMetrics }),
      );
      expect(state.loading).toBe(false); // Shouldn't trigger a loading spinner
      expect(state.metrics).toEqual(mockMetrics);
    });
  });
});
