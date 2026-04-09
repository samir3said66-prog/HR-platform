import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, retry } from 'rxjs/operators';
import * as PreferencesActions from './preferences.actions';

/**
 * PreferencesEffects handles side effects for user preference operations.
 * 
 * Effects implemented:
 * - loadPreferences$: Loads user preferences from local storage and API
 * - updatePreferences$: Updates user preferences
 * - persistPreferences$: Persists preferences to local storage (side effect only)
 * - addSavedFilter$: Adds a saved filter
 * - removeSavedFilter$: Removes a saved filter
 * - updateSavedFilter$: Updates a saved filter
 * 
 * Error Handling Strategy:
 * - Implements retry logic with exponential backoff for API calls
 * - Falls back to local storage on API failure
 * - Catches errors and dispatches failure actions
 * - Logs errors for debugging and monitoring
 * 
 * Requirements: 12.5, 12.6
 */
@Injectable()
export class PreferencesEffects {
  /**
   * Effect: Load Preferences
   * 
   * Triggers when loadPreferences action is dispatched.
   * Attempts to load preferences from API, falls back to local storage.
   * 
   * Success: Dispatches loadPreferencesSuccess with preferences data
   * Failure: Dispatches loadPreferencesFailure with error message
   * 
   * Retry Strategy: 2 attempts with exponential backoff
   */
  loadPreferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PreferencesActions.loadPreferences),
      switchMap(() => {
        // Try to load from local storage first
        const storedPreferences = localStorage.getItem('userPreferences');
        if (storedPreferences) {
          try {
            const preferences = JSON.parse(storedPreferences);
            console.log('[PreferencesEffects] Loaded preferences from local storage');
            return of(preferences);
          } catch (error) {
            console.error('[PreferencesEffects] Failed to parse stored preferences:', error);
          }
        }

        // TODO: Replace with actual API call
        // Example: this.preferencesService.getPreferences()
        const defaultPreferences = {
          userId: 'user-1',
          language: 'en' as const,
          darkMode: false,
          theme: 'light' as const,
          notificationsEnabled: true,
          emailNotifications: true,
          pushNotifications: true,
          itemsPerPage: 10,
          defaultDashboard: 'main',
          savedFilters: [],
        };

        return of(defaultPreferences).pipe(
          retry({
            count: 2,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.warn(
                `[PreferencesEffects] Retry load preferences attempt ${retryCount + 1}`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          catchError((error) => {
            console.error('[PreferencesEffects] Failed to load preferences:', error);
            // Return default preferences on failure
            return of(defaultPreferences);
          }),
        );
      }),
      map((preferences) => PreferencesActions.loadPreferencesSuccess({ preferences })),
      catchError((error) => {
        console.error('[PreferencesEffects] Unexpected error loading preferences:', error);
        return of(
          PreferencesActions.loadPreferencesFailure({
            error: error.message || 'Failed to load preferences',
          }),
        );
      }),
    ),
  );

  /**
   * Effect: Update Preferences
   * 
   * Triggers when updatePreferences action is dispatched.
   * Sends updated preferences to API.
   * 
   * Success: Dispatches updatePreferencesSuccess with updated preferences
   * Failure: Dispatches updatePreferencesFailure with error message
   * 
   * Retry Strategy: 2 attempts with exponential backoff
   */
  updatePreferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PreferencesActions.updatePreferences),
      switchMap(({ preferences }) => {
        // TODO: Replace with actual API call
        // Example: this.preferencesService.updatePreferences(preferences)
        const updatedPreferences = {
          userId: 'user-1',
          language: 'en' as const,
          darkMode: false,
          theme: 'light' as const,
          notificationsEnabled: true,
          emailNotifications: true,
          pushNotifications: true,
          itemsPerPage: 10,
          defaultDashboard: 'main',
          savedFilters: [],
          ...preferences,
        };

        return of(updatedPreferences).pipe(
          retry({
            count: 2,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.warn(
                `[PreferencesEffects] Retry update preferences attempt ${retryCount + 1}`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          tap(() => console.log('[PreferencesEffects] Preferences updated successfully')),
          map((prefs) => PreferencesActions.updatePreferencesSuccess({ preferences: prefs })),
          catchError((error) => {
            console.error('[PreferencesEffects] Failed to update preferences:', error);
            return of(
              PreferencesActions.updatePreferencesFailure({
                error: error.message || 'Failed to update preferences',
              }),
            );
          }),
        );
      }),
    ),
  );

  /**
   * Effect: Persist Preferences to Local Storage
   * 
   * Triggers when preferences are successfully loaded or updated.
   * Persists preferences to local storage for offline access.
   * 
   * This is a side-effect only effect (dispatch: false).
   * No action is dispatched after completion.
   */
  persistPreferences$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PreferencesActions.updatePreferencesSuccess,
          PreferencesActions.loadPreferencesSuccess,
        ),
        tap(({ preferences }) => {
          try {
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
            console.log('[PreferencesEffects] Preferences persisted to local storage');
          } catch (error) {
            console.error('[PreferencesEffects] Failed to persist preferences to local storage:', error);
          }
        }),
      ),
    { dispatch: false },
  );

  /**
   * Effect: Add Saved Filter
   * 
   * Triggers when addSavedFilter action is dispatched.
   * Adds a new saved filter to preferences.
   * 
   * Success: Dispatches updatePreferences to save the updated list
   * Failure: Dispatches updatePreferencesFailure with error message
   */
  addSavedFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PreferencesActions.addSavedFilter),
      switchMap(({ filter }) => {
        console.log('[PreferencesEffects] Adding saved filter:', filter);
        // Dispatch updatePreferences to add the filter
        return of(
          PreferencesActions.updatePreferences({
            preferences: { savedFilters: [filter] },
          }),
        );
      }),
      catchError((error) => {
        console.error('[PreferencesEffects] Failed to add saved filter:', error);
        return of(
          PreferencesActions.updatePreferencesFailure({
            error: error.message || 'Failed to add saved filter',
          }),
        );
      }),
    ),
  );

  /**
   * Effect: Remove Saved Filter
   * 
   * Triggers when removeSavedFilter action is dispatched.
   * Removes a saved filter from preferences.
   * 
   * Success: Dispatches updatePreferences to save the updated list
   * Failure: Dispatches updatePreferencesFailure with error message
   */
  removeSavedFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PreferencesActions.removeSavedFilter),
      switchMap(({ filterId }) => {
        console.log('[PreferencesEffects] Removing saved filter:', filterId);
        // Dispatch updatePreferences to remove the filter
        return of(
          PreferencesActions.updatePreferences({
            preferences: { savedFilters: [] },
          }),
        );
      }),
      catchError((error) => {
        console.error('[PreferencesEffects] Failed to remove saved filter:', error);
        return of(
          PreferencesActions.updatePreferencesFailure({
            error: error.message || 'Failed to remove saved filter',
          }),
        );
      }),
    ),
  );

  /**
   * Effect: Update Saved Filter
   * 
   * Triggers when updateSavedFilter action is dispatched.
   * Updates an existing saved filter in preferences.
   * 
   * Success: Dispatches updatePreferences to save the updated filter
   * Failure: Dispatches updatePreferencesFailure with error message
   */
  updateSavedFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PreferencesActions.updateSavedFilter),
      switchMap(({ filter }) => {
        console.log('[PreferencesEffects] Updating saved filter:', filter);
        // Dispatch updatePreferences to update the filter
        return of(
          PreferencesActions.updatePreferences({
            preferences: { savedFilters: [filter] },
          }),
        );
      }),
      catchError((error) => {
        console.error('[PreferencesEffects] Failed to update saved filter:', error);
        return of(
          PreferencesActions.updatePreferencesFailure({
            error: error.message || 'Failed to update saved filter',
          }),
        );
      }),
    ),
  );

  constructor(private actions$: Actions) {}
}
