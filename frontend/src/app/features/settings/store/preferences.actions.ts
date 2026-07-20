import { createAction, props } from '@ngrx/store';
import { UserPreferences, SavedFilter } from './preferences.state';

export const loadPreferences = createAction('[Preferences] Load Preferences');

export const loadPreferencesSuccess = createAction(
  '[Preferences] Load Preferences Success',
  props<{ preferences: UserPreferences }>(),
);

export const loadPreferencesFailure = createAction(
  '[Preferences] Load Preferences Failure',
  props<{ error: string }>(),
);

export const updatePreferences = createAction(
  '[Preferences] Update Preferences',
  props<{ preferences: Partial<UserPreferences> }>(),
);

export const updatePreferencesSuccess = createAction(
  '[Preferences] Update Preferences Success',
  props<{ preferences: UserPreferences }>(),
);

export const updatePreferencesFailure = createAction(
  '[Preferences] Update Preferences Failure',
  props<{ error: string }>(),
);

export const toggleDarkMode = createAction('[Preferences] Toggle Dark Mode');

export const setLanguage = createAction(
  '[Preferences] Set Language',
  props<{ language: 'en' | 'ar' }>(),
);

export const addSavedFilter = createAction(
  '[Preferences] Add Saved Filter',
  props<{ filter: SavedFilter }>(),
);

export const removeSavedFilter = createAction(
  '[Preferences] Remove Saved Filter',
  props<{ filterId: string }>(),
);

export const updateSavedFilter = createAction(
  '[Preferences] Update Saved Filter',
  props<{ filter: SavedFilter }>(),
);
