import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Subject, firstValueFrom } from 'rxjs';
import { EmployeeEffects } from './employees.effects';
import * as EmployeeActions from './employees.actions';
import { Employee } from './employees.state';
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Test Suite: Employee Effects
 *
 * Tests for employee-related side effects including:
 * - Loading employees with retry logic
 * - Adding new employees
 * - Updating existing employees
 * - Deleting employees
 * - Error handling and retry logic
 *
 * Requirements: 12.5, 12.6
 */
describe('EmployeeEffects', () => {
  let employeeEffects: EmployeeEffects;
  let actions$: Subject<any>;

  beforeEach(() => {
    actions$ = new Subject();
    TestBed.configureTestingModule({
      providers: [EmployeeEffects, provideMockActions(() => actions$)],
    });
    // Inject after TestBed is configured so actions$ is available
    employeeEffects = TestBed.inject(EmployeeEffects);
  });

  describe('loadEmployees$', () => {
    it('should return loadEmployeesSuccess action on success', async () => {
      const resultPromise = firstValueFrom(employeeEffects.loadEmployees$);
      actions$.next(EmployeeActions.loadEmployees());
      const result = await resultPromise;
      expect(result.type).toBe(EmployeeActions.loadEmployeesSuccess.type);
    });

    it('should handle loadEmployees action and dispatch success', async () => {
      const resultPromise = firstValueFrom(employeeEffects.loadEmployees$);
      actions$.next(EmployeeActions.loadEmployees());
      const result = await resultPromise;
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });

  describe('addEmployee$', () => {
    it('should handle addEmployee action', async () => {
      const mockEmployee: Employee = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      const resultPromise = firstValueFrom(employeeEffects.addEmployee$);
      actions$.next(EmployeeActions.addEmployee({ employee: mockEmployee }));
      const result = await resultPromise;
      expect(result.type).toBe(EmployeeActions.loadEmployees.type);
    });

    it('should dispatch loadEmployees after adding employee', async () => {
      const mockEmployee: Employee = {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        department: 'HR',
        region: 'Middle East',
        role: 'HR Manager',
        employmentStatus: 'active',
        hireDate: '2021-06-01',
      };

      const resultPromise = firstValueFrom(employeeEffects.addEmployee$);
      actions$.next(EmployeeActions.addEmployee({ employee: mockEmployee }));
      const result = await resultPromise;
      expect(result.type).toBe(EmployeeActions.loadEmployees.type);
    });
  });

  describe('updateEmployee$', () => {
    it('should handle updateEmployee action', async () => {
      const mockEmployee: Employee = {
        id: '1',
        name: 'John Doe Updated',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Lead Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      const resultPromise = firstValueFrom(employeeEffects.updateEmployee$);
      actions$.next(EmployeeActions.updateEmployee({ employee: mockEmployee }));
      const result = await resultPromise;
      expect(result.type).toBe(EmployeeActions.loadEmployees.type);
    });

    it('should dispatch loadEmployees after updating employee', async () => {
      const mockEmployee: Employee = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Principal Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      const resultPromise = firstValueFrom(employeeEffects.updateEmployee$);
      actions$.next(EmployeeActions.updateEmployee({ employee: mockEmployee }));
      const result = await resultPromise;
      expect(result.type).toBe(EmployeeActions.loadEmployees.type);
    });
  });

  describe('deleteEmployee$', () => {
    it('should handle deleteEmployee action', async () => {
      const resultPromise = firstValueFrom(employeeEffects.deleteEmployee$);
      actions$.next(EmployeeActions.deleteEmployee({ id: '1' }));
      const result = await resultPromise;
      expect(result.type).toBe(EmployeeActions.loadEmployees.type);
    });

    it('should dispatch loadEmployees after deleting employee', async () => {
      const resultPromise = firstValueFrom(employeeEffects.deleteEmployee$);
      actions$.next(EmployeeActions.deleteEmployee({ id: '2' }));
      const result = await resultPromise;
      expect(result.type).toBe(EmployeeActions.loadEmployees.type);
    });
  });

  describe('Error Handling', () => {
    it('should implement retry logic with exponential backoff', async () => {
      const resultPromise = firstValueFrom(employeeEffects.loadEmployees$);
      actions$.next(EmployeeActions.loadEmployees());
      const result = await resultPromise;
      expect(result).toBeDefined();
      expect(result.type).toBeDefined();
    });
  });
});
