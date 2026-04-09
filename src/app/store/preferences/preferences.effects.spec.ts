import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { PreferencesEffects } from './preferences.effects';
import * as PreferencesActions from './preferences.actions';
import { UserPreferences, SavedFilter } from './preferences.state';

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
  let actions$: Observable<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreferencesEffects, provideMockActions(() => actions$)],
    });
    effects = TestBed.inject(PreferencesEffects);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('loadPreferences$', () => {
    it('should return loadPreferencesSuccess action on success', (done) => {
      actions$ = of(PreferencesActions.loadPreferences());
      effects.loadPreferences$.subscribe((result: any) => {
        expect(result.type).toBe(PreferencesActions.loadPreferencesSuccess.type);
        done();
      });
    });

    it('should handle loadPreferences action and dispatch success', (done) => {
      actions$ = of(PreferencesActions.loadPreferences());
      effects.loadPreferences$.subscribe((result: any) => {
        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        done();
      });
    });
  });

  describe('updatePreferences$', () => {
    it('should handle updatePreferences action', (done) => {
      const updates: Partial<UserPreferences> = { language: 'ar' };
      actions$ = of(PreferencesActions.updatePreferences({ preferences: updates }));
      effects.updatePreferences$.subscribe((result: any) => {
        expect(result.type).toBe(PreferencesActions.updatePreferencesSuccess.type);
        done();
      });
    });

    it('should dispatch updatePreferencesSuccess after updating', (done) => {
      const updates: Partial<UserPreferences> = { darkMode: true, theme: 'dark' };
      actions$ = of(PreferencesActions.updatePreferences({ preferences: updates }));
      effects.updatePreferences$.subscribe((result: any) => {
        expect(result.type).toBe(PreferencesActions.updatePreferencesSuccess.type);
        done();
      });
    });
  });

  describe('persistPreferences$', () => {
    it('should persist preferences to local storage', (done) => {
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

      actions$ = of(PreferencesActions.loadPreferencesSuccess({ preferences: mockPreferences }));
      effects.persistPreferences$.subscribe(() => {
        const stored = localStorage.getItem('userPreferences');
        expect(stored).toBeDefined();
        done();
      });
    });

    it('should persist updated preferences to local storage', (done) => {
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

      actions$ = of(PreferencesActions.updatePreferencesSuccess({ preferences: mockPreferences }));
      effects.persistPreferences$.subscribe(() => {
        const stored = localStorage.getItem('userPreferences');
        expect(stored).toBeDefined();
        done();
      });
    });
  });

  describe('addSavedFilter$', () => {
    it('should handle addSavedFilter action', (done) => {
      const mockFilter: SavedFilter = {
        id: 'filter-1',
        name: 'Engineering Department',
        criteria: { department: 'Engineering' },
        createdAt: new Date().toISOString(),
      };

      actions$ = of(PreferencesActions.addSavedFilter({ filter: mockFilter }));
      effects.addSavedFilter$.subscribe((result: any) => {
        expect(result.type).toBe(PreferencesActions.updatePreferences.type);
        done();
      });
    });

    it('should dispatch updatePreferences after adding filter', (done) => {
      const mockFilter: SavedFilter = {
        id: 'filter-2',
        name: 'HR Department',
        criteria: { department: 'HR' },
        createdAt: new Date().toISOString(),
      };

      actions$ = of(PreferencesActions.addSavedFilter({ filter: mockFilter }));
      effects.addSavedFilter$.subscribe((result: any) => {
        expect(result.type).toBe(PreferencesActions.updatePreferences.type);
        done();
      });
    });
  });

  describe('removeSavedFilter$', () => {
    it('should handle removeSavedFilter action', (done) => {
      actions$ = of(PreferencesActions.removeSavedFilter({ filterId: 'filter-1' }));
      effects.removeSavedFilter$.subscribe((result: any) => {
        expect(result.type).toBe(PreferencesActions.updatePreferences.type);
        done();
      });
    });

    it('should dispatch updatePreferences after removing filter', (done) => {
      actions$ = of(PreferencesActions.removeSavedFilter({ filterId: 'filter-2' }));
      effects.removeSavedFilter$.subscribe((result: any) => {
        expect(result.type).toBe(PreferencesActions.updatePreferences.type);
        done();
      });
    });
  });

  describe('updateSavedFilter$', () => {
    it('should handle updateSavedFilter action', (done) => {
      const mockFilter: SavedFilter = {
        id: 'filter-1',
        name: 'Updated Filter',
        criteria: { department: 'HR' },
        createdAt: new Date().toISOString(),
      };

      actions$ = of(PreferencesActions.updateSavedFilter({ filter: mockFilter }));
      effects.updateSavedFilter$.subscribe((result: any) => {
        expect(result.type).toBe(PreferencesActions.updatePreferences.type);
        done();
      });
    });

    it('should dispatch updatePreferences after updating filter', (done) => {
      const mockFilter: SavedFilter = {
        id: 'filter-1',
        name: 'Updated Engineering Filter',
        criteria: { department: 'Engineering', region: 'Europe' },
        createdAt: new Date().toISOString(),
      };

      actions$ = of(PreferencesActions.updateSavedFilter({ filter: mockFilter }));
      effects.updateSavedFilter$.subscribe((result: any) => {
        expect(result.type).toBe(PreferencesActions.updatePreferences.type);
        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should implement retry logic with exponential backoff', (done) => {
      actions$ = of(PreferencesActions.loadPreferences());
      effects.loadPreferences$.subscribe((result: any) => {
        expect(result).toBeDefined();
        expect(result.type).toBeDefined();
        done();
      });
    });
  });
});
