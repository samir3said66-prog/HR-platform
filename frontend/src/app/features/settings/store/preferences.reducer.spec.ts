import { preferencesReducer } from './preferences.reducer';
import { initialPreferencesState, UserPreferences, SavedFilter } from './preferences.state';
import * as PreferencesActions from './preferences.actions';
import { describe, it, expect } from 'vitest';

/**
 * Unit Tests: Preferences Reducer
 * Requirements: 21.1, 28.1
 */

const mockPreferences: UserPreferences = {
  userId: 'user-1',
  language: 'en',
  darkMode: false,
  theme: 'light',
  notificationsEnabled: true,
  emailNotifications: true,
  pushNotifications: false,
  itemsPerPage: 10,
  defaultDashboard: 'config-1',
  savedFilters: [],
};

const mockFilter: SavedFilter = {
  id: 'filter-1',
  name: 'Sales Dept',
  criteria: { department: 'Sales' },
  createdAt: new Date().toISOString(),
};

describe('preferencesReducer', () => {
  it('should return initial state by default', () => {
    const state = preferencesReducer(undefined, { type: '@@INIT' } as any);
    expect(state).toEqual(initialPreferencesState);
  });

  describe('loadPreferences', () => {
    it('should set loading to true and clear error', () => {
      const state = preferencesReducer(
        { ...initialPreferencesState, error: 'error' },
        PreferencesActions.loadPreferences()
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('loadPreferencesSuccess', () => {
    it('should set preferences and clear loading', () => {
      const state = preferencesReducer(
        { ...initialPreferencesState, loading: true },
        PreferencesActions.loadPreferencesSuccess({ preferences: mockPreferences })
      );
      expect(state.loading).toBe(false);
      expect(state.preferences).toEqual({ ...mockPreferences });
    });
  });

  describe('loadPreferencesFailure', () => {
    it('should set error and clear loading', () => {
      const state = preferencesReducer(
        { ...initialPreferencesState, loading: true },
        PreferencesActions.loadPreferencesFailure({ error: 'Failed' })
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed');
    });
  });

  describe('toggleDarkMode', () => {
    it('should toggle from light to dark', () => {
      const state = preferencesReducer(
        { ...initialPreferencesState, preferences: mockPreferences },
        PreferencesActions.toggleDarkMode()
      );
      expect(state.preferences?.darkMode).toBe(true);
      expect(state.preferences?.theme).toBe('dark');
    });

    it('should toggle from dark to light', () => {
      const darkPrefs = { ...mockPreferences, darkMode: true, theme: 'dark' as const };
      const state = preferencesReducer(
        { ...initialPreferencesState, preferences: darkPrefs },
        PreferencesActions.toggleDarkMode()
      );
      expect(state.preferences?.darkMode).toBe(false);
      expect(state.preferences?.theme).toBe('light');
    });
  });

  describe('setLanguage', () => {
    it('should change language setting', () => {
      const state = preferencesReducer(
        { ...initialPreferencesState, preferences: mockPreferences },
        PreferencesActions.setLanguage({ language: 'ar' })
      );
      expect(state.preferences?.language).toBe('ar');
    });
  });

  describe('Saved Filters', () => {
    const stateWithPrefs = { ...initialPreferencesState, preferences: mockPreferences };

    it('should add a saved filter', () => {
      const state = preferencesReducer(
        stateWithPrefs,
        PreferencesActions.addSavedFilter({ filter: mockFilter })
      );
      expect(state.preferences?.savedFilters).toContain(mockFilter);
      expect(state.preferences?.savedFilters.length).toBe(1);
    });

    it('should update a saved filter', () => {
      const stateWithFilter = { ...stateWithPrefs, preferences: { ...mockPreferences, savedFilters: [mockFilter] } };
      const updatedFilter = { ...mockFilter, name: 'Updated name' };
      const state = preferencesReducer(
        stateWithFilter,
        PreferencesActions.updateSavedFilter({ filter: updatedFilter })
      );
      expect(state.preferences?.savedFilters[0].name).toBe('Updated name');
    });

    it('should remove a saved filter', () => {
      const stateWithFilter = { ...stateWithPrefs, preferences: { ...mockPreferences, savedFilters: [mockFilter] } };
      const state = preferencesReducer(
        stateWithFilter,
        PreferencesActions.removeSavedFilter({ filterId: mockFilter.id })
      );
      expect(state.preferences?.savedFilters.length).toBe(0);
    });
  });
});
