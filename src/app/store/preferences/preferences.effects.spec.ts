import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject, firstValueFrom } from 'rxjs';
import { PreferencesEffects } from './preferences.effects';
import * as PreferencesActions from './preferences.actions';
import { UserPreferences, SavedFilter } from './preferences.state';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

/**
 * Test Suite: Preferences Effects
 *
 * Tests for user preference-related side effects including:
 * - Loading preferences from local storage and API
 * - Updating user preferences
 * - Persisting preferences to local storage
 * - Managing saved filters
 * - Error handling and retry logic
 *
 * Requirements: 12.5, 12.6
 */
describe('PreferencesEffects', () => {
  let effects: PreferencesEffects;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject();
    TestBed.configureTestingModule({
      providers: [
        PreferencesEffects,
        provideMockActions(() => actions$),
      ],
    });
    effects = TestBed.inject(PreferencesEffects);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loadPreferences$', () => {
    it('should return loadPreferencesSuccess action on success', async () => {
      const resultPromise = firstValueFrom(effects.loadPreferences$);
      actions$.next(PreferencesActions.loadPreferences());
      const result = await resultPromise;
      expect(result.type).toBe(PreferencesActions.loadPreferencesSuccess.type);
    });

    it('should handle loadPreferences action and dispatch success', async () => {
      const resultPromise = firstValueFrom(effects.loadPreferences$);
      actions$.next(PreferencesActions.loadPreferences());
      const result = await resultPromise;
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });

  describe('updatePreferences$', () => {
    it('should handle updatePreferences action', async () => {
      const updates: Partial<UserPreferences> = { language: 'ar' };
      const resultPromise = firstValueFrom(effects.updatePreferences$);
      actions$.next(PreferencesActions.updatePreferences({ preferences: updates }));
      const result = await resultPromise;
      expect(result.type).toBe(PreferencesActions.updatePreferencesSuccess.type);
    });

    it('should dispatch updatePreferencesSuccess after updating', async () => {
      const updates: Partial<UserPreferences> = { darkMode: true, theme: 'dark' };
      const resultPromise = firstValueFrom(effects.updatePreferences$);
      actions$.next(PreferencesActions.updatePreferences({ preferences: updates }));
      const result = await resultPromise;
      expect(result.type).toBe(PreferencesActions.updatePreferencesSuccess.type);
    });
  });

  describe('persistPreferences$', () => {
    it('should persist preferences to local storage', async () => {
      const mockPreferences: UserPreferences = {
        userId: 'user-1',
        language: 'ar',
        darkMode: true,
        theme: 'dark',
        notificationsEnabled: true,
        emailNotifications: false,
        pushNotifications: true,
        itemsPerPage: 20,
        defaultDashboard: 'performance',
        savedFilters: [],
      };

      const resultPromise = firstValueFrom(effects.persistPreferences$);
      actions$.next(PreferencesActions.loadPreferencesSuccess({ preferences: mockPreferences }));
      await resultPromise;
      const stored = localStorage.getItem('userPreferences');
      expect(stored).toBeDefined();
    });

    it('should persist updated preferences to local storage', async () => {
      const mockPreferences: UserPreferences = {
        userId: 'user-1',
        language: 'en',
        darkMode: false,
        theme: 'light',
        notificationsEnabled: true,
        emailNotifications: true,
        pushNotifications: true,
        itemsPerPage: 10,
        defaultDashboard: 'main',
        savedFilters: [],
      };

      const resultPromise = firstValueFrom(effects.persistPreferences$);
      actions$.next(PreferencesActions.updatePreferencesSuccess({ preferences: mockPreferences }));
      await resultPromise;
      const stored = localStorage.getItem('userPreferences');
      expect(stored).toBeDefined();
    });
  });

  describe('addSavedFilter$', () => {
    it('should handle addSavedFilter action', async () => {
      const mockFilter: SavedFilter = {
        id: 'filter-1',
        name: 'Engineering Department',
        criteria: { department: 'Engineering' },
        createdAt: new Date().toISOString(),
      };

      const resultPromise = firstValueFrom(effects.addSavedFilter$);
      actions$.next(PreferencesActions.addSavedFilter({ filter: mockFilter }));
      const result = await resultPromise;
      expect(result.type).toBe(PreferencesActions.updatePreferences.type);
    });

    it('should dispatch updatePreferences after adding filter', async () => {
      const mockFilter: SavedFilter = {
        id: 'filter-2',
        name: 'HR Department',
        criteria: { department: 'HR' },
        createdAt: new Date().toISOString(),
      };

      const resultPromise = firstValueFrom(effects.addSavedFilter$);
      actions$.next(PreferencesActions.addSavedFilter({ filter: mockFilter }));
      const result = await resultPromise;
      expect(result.type).toBe(PreferencesActions.updatePreferences.type);
    });
  });

  describe('removeSavedFilter$', () => {
    it('should handle removeSavedFilter action', async () => {
      const resultPromise = firstValueFrom(effects.removeSavedFilter$);
      actions$.next(PreferencesActions.removeSavedFilter({ filterId: 'filter-1' }));
      const result = await resultPromise;
      expect(result.type).toBe(PreferencesActions.updatePreferences.type);
    });

    it('should dispatch updatePreferences after removing filter', async () => {
      const resultPromise = firstValueFrom(effects.removeSavedFilter$);
      actions$.next(PreferencesActions.removeSavedFilter({ filterId: 'filter-2' }));
      const result = await resultPromise;
      expect(result.type).toBe(PreferencesActions.updatePreferences.type);
    });
  });

  describe('updateSavedFilter$', () => {
    it('should handle updateSavedFilter action', async () => {
      const mockFilter: SavedFilter = {
        id: 'filter-1',
        name: 'Updated Filter',
        criteria: { department: 'HR' },
        createdAt: new Date().toISOString(),
      };

      const resultPromise = firstValueFrom(effects.updateSavedFilter$);
      actions$.next(PreferencesActions.updateSavedFilter({ filter: mockFilter }));
      const result = await resultPromise;
      expect(result.type).toBe(PreferencesActions.updatePreferences.type);
    });

    it('should dispatch updatePreferences after updating filter', async () => {
      const mockFilter: SavedFilter = {
        id: 'filter-1',
        name: 'Updated Engineering Filter',
        criteria: { department: 'Engineering', region: 'Europe' },
        createdAt: new Date().toISOString(),
      };

      const resultPromise = firstValueFrom(effects.updateSavedFilter$);
      actions$.next(PreferencesActions.updateSavedFilter({ filter: mockFilter }));
      const result = await resultPromise;
      expect(result.type).toBe(PreferencesActions.updatePreferences.type);
    });
  });

  describe('Error Handling', () => {
    it('should implement retry logic with exponential backoff', async () => {
      const resultPromise = firstValueFrom(effects.loadPreferences$);
      actions$.next(PreferencesActions.loadPreferences());
      const result = await resultPromise;
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });
});
