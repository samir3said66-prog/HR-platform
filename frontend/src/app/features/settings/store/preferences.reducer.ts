import { createReducer, on } from '@ngrx/store';
import { PreferencesState, initialPreferencesState } from './preferences.state';
import * as PreferencesActions from './preferences.actions';

export const preferencesReducer = createReducer(
  initialPreferencesState,
  on(PreferencesActions.loadPreferences, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PreferencesActions.loadPreferencesSuccess, (state, { preferences }) => ({
    ...state,
    preferences,
    loading: false,
    error: null,
  })),
  on(PreferencesActions.loadPreferencesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(PreferencesActions.updatePreferences, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(PreferencesActions.updatePreferencesSuccess, (state, { preferences }) => ({
    ...state,
    preferences,
    loading: false,
    error: null,
  })),
  on(PreferencesActions.updatePreferencesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(PreferencesActions.toggleDarkMode, (state) => {
    if (!state.preferences) return state;
    return {
      ...state,
      preferences: {
        ...state.preferences,
        darkMode: !state.preferences.darkMode,
        theme: state.preferences.darkMode ? 'light' : 'dark',
      },
    };
  }),
  on(PreferencesActions.setLanguage, (state, { language }) => {
    if (!state.preferences) return state;
    return {
      ...state,
      preferences: {
        ...state.preferences,
        language,
      },
    };
  }),
  on(PreferencesActions.addSavedFilter, (state, { filter }) => {
    if (!state.preferences) return state;
    return {
      ...state,
      preferences: {
        ...state.preferences,
        savedFilters: [...state.preferences.savedFilters, filter],
      },
    };
  }),
  on(PreferencesActions.removeSavedFilter, (state, { filterId }) => {
    if (!state.preferences) return state;
    return {
      ...state,
      preferences: {
        ...state.preferences,
        savedFilters: state.preferences.savedFilters.filter((f) => f.id !== filterId),
      },
    };
  }),
  on(PreferencesActions.updateSavedFilter, (state, { filter }) => {
    if (!state.preferences) return state;
    return {
      ...state,
      preferences: {
        ...state.preferences,
        savedFilters: state.preferences.savedFilters.map((f) => (f.id === filter.id ? filter : f)),
      },
    };
  }),
);
