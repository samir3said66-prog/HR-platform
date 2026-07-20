import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap, retry } from 'rxjs/operators';
import * as PreferencesActions from './preferences.actions';

/**
 * PreferencesEffects handles side effects for user preference operations.
 */
@Injectable()
export class PreferencesEffects {
  private actions$ = inject(Actions);

  /**
   * Effect: Load Preferences
   */
  readonly loadPreferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PreferencesActions.loadPreferences),
      switchMap(() => {
        const storedPreferences = localStorage.getItem('userPreferences');
        if (storedPreferences) {
          try {
            const preferences = JSON.parse(storedPreferences);
            return of(preferences);
          } catch (error) {
            console.error('[PreferencesEffects] Failed to parse stored preferences:', error);
          }
        }

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
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          catchError(() => of(defaultPreferences)),
        );
      }),
      map((preferences) => PreferencesActions.loadPreferencesSuccess({ preferences })),
      catchError((error) =>
        of(
          PreferencesActions.loadPreferencesFailure({
            error: error.message || 'Failed to load preferences',
          }),
        ),
      ),
    ),
  );

  /**
   * Effect: Update Preferences
   */
  readonly updatePreferences$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PreferencesActions.updatePreferences),
      switchMap(({ preferences }) => {
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
          retry(2),
          tap(() => console.log('[PreferencesEffects] Preferences updated successfully')),
          map((prefs) => PreferencesActions.updatePreferencesSuccess({ preferences: prefs })),
          catchError((error) =>
            of(
              PreferencesActions.updatePreferencesFailure({
                error: error.message || 'Failed to update preferences',
              }),
            ),
          ),
        );
      }),
    ),
  );

  /**
   * Effect: Persist Preferences to Local Storage
   */
  readonly persistPreferences$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PreferencesActions.updatePreferencesSuccess,
          PreferencesActions.loadPreferencesSuccess,
        ),
        tap(({ preferences }) => {
          try {
            localStorage.setItem('userPreferences', JSON.stringify(preferences));
          } catch (error) {
            console.error(
              '[PreferencesEffects] Failed to persist preferences to local storage:',
              error,
            );
          }
        }),
      ),
    { dispatch: false },
  );

  /**
   * Effect: Add Saved Filter
   */
  readonly addSavedFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PreferencesActions.addSavedFilter),
      switchMap(({ filter }) =>
        of(
          PreferencesActions.updatePreferences({
            preferences: { savedFilters: [filter] },
          }),
        ),
      ),
      catchError((error) =>
        of(
          PreferencesActions.updatePreferencesFailure({
            error: error.message || 'Failed to add saved filter',
          }),
        ),
      ),
    ),
  );

  /**
   * Effect: Remove Saved Filter
   */
  readonly removeSavedFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PreferencesActions.removeSavedFilter),
      switchMap(() =>
        of(
          PreferencesActions.updatePreferences({
            preferences: { savedFilters: [] },
          }),
        ),
      ),
      catchError((error) =>
        of(
          PreferencesActions.updatePreferencesFailure({
            error: error.message || 'Failed to remove saved filter',
          }),
        ),
      ),
    ),
  );

  /**
   * Effect: Update Saved Filter
   */
  readonly updateSavedFilter$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PreferencesActions.updateSavedFilter),
      switchMap(({ filter }) =>
        of(
          PreferencesActions.updatePreferences({
            preferences: { savedFilters: [filter] },
          }),
        ),
      ),
      catchError((error) =>
        of(
          PreferencesActions.updatePreferencesFailure({
            error: error.message || 'Failed to update saved filter',
          }),
        ),
      ),
    ),
  );
}
