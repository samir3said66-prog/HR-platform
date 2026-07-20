/**
 * Settings/Preferences Feature Store Configuration
 * Exports reducer and effects for feature store registration
 */

import { preferencesReducer } from './preferences.reducer';
import { PreferencesEffects } from './preferences.effects';

export const PREFERENCES_STORE_CONFIG = {
  featureName: 'preferences',
  reducer: preferencesReducer,
  effects: [PreferencesEffects],
};

export { preferencesReducer, PreferencesEffects };
