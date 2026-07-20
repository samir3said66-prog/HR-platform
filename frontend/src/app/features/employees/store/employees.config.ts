/**
 * Employees Feature Store Configuration
 * Exports reducer and effects for feature store registration
 */

import { employeeReducer } from './employees.reducer';
import { EmployeeEffects } from './employees.effects';

export const EMPLOYEES_STORE_CONFIG = {
  featureName: 'employees',
  reducer: employeeReducer,
  effects: [EmployeeEffects],
};

export { employeeReducer, EmployeeEffects };
