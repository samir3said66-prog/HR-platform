/**
 * Performance Feature Store Configuration
 * Exports reducer and effects for feature store registration
 */

import { performanceReducer } from './performance.reducer';
import { PerformanceEffects } from './performance.effects';

export const PERFORMANCE_STORE_CONFIG = {
  featureName: 'performance',
  reducer: performanceReducer,
  effects: [PerformanceEffects],
};

export { performanceReducer, PerformanceEffects };
