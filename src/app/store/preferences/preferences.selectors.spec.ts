import { createSelector } from '@ngrx/store';
import {
  selectPreferences,
  selectPreferencesLoading,
  selectPreferencesError,
  selectLanguage,
  selectDarkMode,
  selectTheme,
  selectNotificationsEnabled,
  selectEmailNotifications,
  selectPushNotifications,
  selectItemsPerPage,
  selectDefaultDashboard,
  selectSavedFilters,
  selectSavedFilterById,
} from './preferences.selectors';
import { PreferencesState, UserPreferences } from './preferences.state';
import { describe, it, expect } from 'vitest';

/**
 * Unit Tests: Preferences Selectors
 * Requirements: 21.1, 28.1
 */

const mockPreferences: UserPreferences = {
  userId: 'user-1',
  language: 'ar',
  darkMode: true,
  theme: 'dark',
  notificationsEnabled: true,
  emailNotifications: true,
  pushNotifications: false,
  itemsPerPage: 20,
  defaultDashboard: 'config-2',
  savedFilters: [
    {
      id: 'f1',
      name: 'Engineering',
      criteria: { department: 'Engineering' },
      createdAt: '2023-01-01',
    },
  ],
};

const mockState: PreferencesState = {
  preferences: mockPreferences,
  loading: false,
  error: null,
};

const mockRootState = { preferences: mockState };
const emptyRootState = { preferences: { preferences: null, loading: false, error: null } };

describe('Preferences Selectors', () => {
  describe('selectPreferences', () => {
    it('should return preferences object', () => {
      const result = selectPreferences(mockRootState as any);
      expect(result).toEqual(mockPreferences);
    });
  });

  describe('selectPreferencesLoading', () => {
    it('should return loading status', () => {
      expect(selectPreferencesLoading(mockRootState as any)).toBe(false);
    });
  });

  describe('selectPreferencesError', () => {
    it('should return error status', () => {
      expect(selectPreferencesError(mockRootState as any)).toBeNull();
    });
  });

  describe('selectLanguage', () => {
    it('should return language or en fallback', () => {
      expect(selectLanguage(mockRootState as any)).toBe('ar');
      expect(selectLanguage(emptyRootState as any)).toBe('en');
    });
  });

  describe('selectDarkMode', () => {
    it('should return dark mode status', () => {
      expect(selectDarkMode(mockRootState as any)).toBe(true);
      expect(selectDarkMode(emptyRootState as any)).toBe(false);
    });
  });

  describe('selectTheme', () => {
    it('should return theme string', () => {
      expect(selectTheme(mockRootState as any)).toBe('dark');
      expect(selectTheme(emptyRootState as any)).toBe('light');
    });
  });

  describe('Notification selectors', () => {
    it('should return generic notifications state', () => {
      expect(selectNotificationsEnabled(mockRootState as any)).toBe(true);
    });

    it('should return email notifications state', () => {
      expect(selectEmailNotifications(mockRootState as any)).toBe(true);
    });

    it('should return push notifications state', () => {
      expect(selectPushNotifications(mockRootState as any)).toBe(false);
    });
  });

  describe('selectItemsPerPage', () => {
    it('should return items per page or default', () => {
      expect(selectItemsPerPage(mockRootState as any)).toBe(20);
      expect(selectItemsPerPage(emptyRootState as any)).toBe(10);
    });
  });

  describe('selectDefaultDashboard', () => {
    it('should return default dashboard name', () => {
      expect(selectDefaultDashboard(mockRootState as any)).toBe('config-2');
      expect(selectDefaultDashboard(emptyRootState as any)).toBe('main');
    });
  });

  describe('Saved Filters', () => {
    it('selectSavedFilters should return filter array', () => {
      const result = selectSavedFilters(mockRootState as any);
      expect(result).toHaveLength(1);
    });

    it('selectSavedFilterById should return a specific filter', () => {
      const selector = selectSavedFilterById('f1');
      const result = selector(mockRootState as any);
      expect(result?.name).toBe('Engineering');
    });

    it('selectSavedFilterById should return undefined if not found', () => {
      const selector = selectSavedFilterById('invalid');
      const result = selector(mockRootState as any);
      expect(result).toBeUndefined();
    });
  });
});
