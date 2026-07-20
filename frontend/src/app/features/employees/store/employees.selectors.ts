import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmployeeState } from './employees.state';

export const selectEmployeeState = createFeatureSelector<EmployeeState>('employees');

export const selectAllEmployees = createSelector(selectEmployeeState, (state) =>
  state.ids.map((id) => state.entities[id]),
);

export const selectEmployeeIds = createSelector(selectEmployeeState, (state) => state.ids);

export const selectEmployeeEntities = createSelector(
  selectEmployeeState,
  (state) => state.entities,
);

export const selectEmployeeLoading = createSelector(selectEmployeeState, (state) => state.loading);

export const selectEmployeeError = createSelector(selectEmployeeState, (state) => state.error);

export const selectSelectedEmployeeId = createSelector(
  selectEmployeeState,
  (state) => state.selectedEmployeeId,
);

export const selectSelectedEmployee = createSelector(selectEmployeeState, (state) =>
  state.selectedEmployeeId ? state.entities[state.selectedEmployeeId] : null,
);

export const selectEmployeeById = (id: string) =>
  createSelector(selectEmployeeEntities, (entities) => entities[id]);

export const selectEmployeesByDepartment = (department: string) =>
  createSelector(selectAllEmployees, (employees) =>
    employees.filter((emp) => emp.department === department),
  );

export const selectEmployeesByRegion = (region: string) =>
  createSelector(selectAllEmployees, (employees) =>
    employees.filter((emp) => emp.region === region),
  );

export const selectEmployeesByStatus = (status: string) =>
  createSelector(selectAllEmployees, (employees) =>
    employees.filter((emp) => emp.employmentStatus === status),
  );
