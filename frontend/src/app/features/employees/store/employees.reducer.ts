import { createReducer, on } from '@ngrx/store';
import { EmployeeState, initialEmployeeState } from './employees.state';
import * as EmployeeActions from './employees.actions';

export const employeeReducer = createReducer(
  initialEmployeeState,
  on(EmployeeActions.loadEmployees, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(EmployeeActions.loadEmployeesSuccess, (state, { employees }) => {
    const entities: { [id: string]: any } = {};
    const ids: string[] = [];
    employees.forEach((employee) => {
      entities[employee.id] = employee;
      ids.push(employee.id);
    });
    return {
      ...state,
      entities,
      ids,
      loading: false,
      error: null,
    };
  }),
  on(EmployeeActions.loadEmployeesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(EmployeeActions.addEmployee, (state, { employee }) => ({
    ...state,
    entities: {
      ...state.entities,
      [employee.id]: employee,
    },
    ids: [...state.ids, employee.id],
  })),
  on(EmployeeActions.updateEmployee, (state, { employee }) => ({
    ...state,
    entities: {
      ...state.entities,
      [employee.id]: employee,
    },
  })),
  on(EmployeeActions.deleteEmployee, (state, { id }) => {
    const { [id]: _, ...entities } = state.entities;
    return {
      ...state,
      entities,
      ids: state.ids.filter((empId) => empId !== id),
    };
  }),
  on(EmployeeActions.selectEmployee, (state, { id }) => ({
    ...state,
    selectedEmployeeId: id,
  })),
  on(EmployeeActions.clearSelectedEmployee, (state) => ({
    ...state,
    selectedEmployeeId: null,
  })),
);
