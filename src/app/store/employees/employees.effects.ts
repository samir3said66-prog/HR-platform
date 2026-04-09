import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, retry, tap } from 'rxjs/operators';
import * as EmployeeActions from './employees.actions';

/**
 * EmployeeEffects handles side effects for employee-related operations.
 * 
 * Effects implemented:
 * - loadEmployees$: Loads employee data from API with retry logic and error handling
 * 
 * Error Handling Strategy:
 * - Implements retry logic with exponential backoff (3 attempts)
 * - Catches errors and dispatches failure actions
 * - Logs errors for debugging and monitoring
 * 
 * Requirements: 12.5, 12.6
 */
@Injectable()
export class EmployeeEffects {
  /**
   * Effect: Load Employees
   * 
   * Triggers when loadEmployees action is dispatched.
   * Fetches employee data from API with retry logic.
   * 
   * Success: Dispatches loadEmployeesSuccess with employee data
   * Failure: Dispatches loadEmployeesFailure with error message after retries exhausted
   * 
   * Retry Strategy: 3 attempts with exponential backoff
   */
  loadEmployees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.loadEmployees),
      switchMap(() =>
        // TODO: Replace with actual API call
        // Example: this.employeeService.getEmployees()
        of([]).pipe(
          // Retry logic: attempt up to 3 times with exponential backoff
          retry({
            count: 3,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
              console.warn(
                `[EmployeeEffects] Retry attempt ${retryCount + 1} after ${delayMs}ms`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          map((employees) => EmployeeActions.loadEmployeesSuccess({ employees })),
          catchError((error) => {
            console.error('[EmployeeEffects] Failed to load employees after retries:', error);
            return of(
              EmployeeActions.loadEmployeesFailure({
                error: error.message || 'Failed to load employees',
              }),
            );
          }),
        ),
      ),
    ),
  );

  /**
   * Effect: Add Employee
   * 
   * Triggers when addEmployee action is dispatched.
   * Sends new employee data to API.
   * 
   * Success: Dispatches loadEmployees to refresh the list
   * Failure: Dispatches loadEmployeesFailure with error message
   * 
   * Retry Strategy: 2 attempts with exponential backoff
   */
  addEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.addEmployee),
      switchMap(({ employee }) =>
        // TODO: Replace with actual API call
        // Example: this.employeeService.addEmployee(employee)
        of(employee).pipe(
          retry({
            count: 2,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.warn(
                `[EmployeeEffects] Retry add employee attempt ${retryCount + 1}`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          tap(() => console.log('[EmployeeEffects] Employee added successfully')),
          switchMap(() => of(EmployeeActions.loadEmployees())),
          catchError((error) => {
            console.error('[EmployeeEffects] Failed to add employee:', error);
            return of(
              EmployeeActions.loadEmployeesFailure({
                error: error.message || 'Failed to add employee',
              }),
            );
          }),
        ),
      ),
    ),
  );

  /**
   * Effect: Update Employee
   * 
   * Triggers when updateEmployee action is dispatched.
   * Sends updated employee data to API.
   * 
   * Success: Dispatches loadEmployees to refresh the list
   * Failure: Dispatches loadEmployeesFailure with error message
   * 
   * Retry Strategy: 2 attempts with exponential backoff
   */
  updateEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.updateEmployee),
      switchMap(({ employee }) =>
        // TODO: Replace with actual API call
        // Example: this.employeeService.updateEmployee(employee)
        of(employee).pipe(
          retry({
            count: 2,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.warn(
                `[EmployeeEffects] Retry update employee attempt ${retryCount + 1}`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          tap(() => console.log('[EmployeeEffects] Employee updated successfully')),
          switchMap(() => of(EmployeeActions.loadEmployees())),
          catchError((error) => {
            console.error('[EmployeeEffects] Failed to update employee:', error);
            return of(
              EmployeeActions.loadEmployeesFailure({
                error: error.message || 'Failed to update employee',
              }),
            );
          }),
        ),
      ),
    ),
  );

  /**
   * Effect: Delete Employee
   * 
   * Triggers when deleteEmployee action is dispatched.
   * Sends delete request to API.
   * 
   * Success: Dispatches loadEmployees to refresh the list
   * Failure: Dispatches loadEmployeesFailure with error message
   * 
   * Retry Strategy: 2 attempts with exponential backoff
   */
  deleteEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.deleteEmployee),
      switchMap(({ id }) =>
        // TODO: Replace with actual API call
        // Example: this.employeeService.deleteEmployee(id)
        of(id).pipe(
          retry({
            count: 2,
            delay: (error, retryCount) => {
              const delayMs = Math.pow(2, retryCount) * 1000;
              console.warn(
                `[EmployeeEffects] Retry delete employee attempt ${retryCount + 1}`,
                error,
              );
              return new Promise((resolve) => setTimeout(resolve, delayMs));
            },
          }),
          tap(() => console.log('[EmployeeEffects] Employee deleted successfully')),
          switchMap(() => of(EmployeeActions.loadEmployees())),
          catchError((error) => {
            console.error('[EmployeeEffects] Failed to delete employee:', error);
            return of(
              EmployeeActions.loadEmployeesFailure({
                error: error.message || 'Failed to delete employee',
              }),
            );
          }),
        ),
      ),
    ),
  );

  constructor(private actions$: Actions) {}
}
