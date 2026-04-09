import { createAction, props } from '@ngrx/store';
import { Employee } from './employees.state';

export const loadEmployees = createAction('[Employees] Load Employees');

export const loadEmployeesSuccess = createAction(
  '[Employees] Load Employees Success',
  props<{ employees: Employee[] }>(),
);

export const loadEmployeesFailure = createAction(
  '[Employees] Load Employees Failure',
  props<{ error: string }>(),
);

export const addEmployee = createAction(
  '[Employees] Add Employee',
  props<{ employee: Employee }>(),
);

export const updateEmployee = createAction(
  '[Employees] Update Employee',
  props<{ employee: Employee }>(),
);

export const deleteEmployee = createAction('[Employees] Delete Employee', props<{ id: string }>());

export const selectEmployee = createAction('[Employees] Select Employee', props<{ id: string }>());

export const clearSelectedEmployee = createAction('[Employees] Clear Selected Employee');
