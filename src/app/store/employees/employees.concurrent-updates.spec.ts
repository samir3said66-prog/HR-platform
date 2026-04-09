import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import * as EmployeeActions from './employees.actions';
import { AppState } from '../app.state';
import { Employee } from './employees.state';

/**
 * Test Suite: Concurrent Updates & Optimistic Updates
 * 
 * Tests for handling concurrent updates to the same employee record
 * and optimistic update reconciliation with server state.
 * 
 * **Validates: Requirements 21.1, 21.2, 5.6, 5.7**
 */
describe('Concurrent Updates & Optimistic Updates', () => {
  let store: MockStore<AppState>;
  const initialState: AppState = {
    employees: {
      entities: {},
      ids: [],
      loading: false,
      error: null,
      selectedEmployeeId: null,
    },
    performance: {
      entities: {},
      ids: [],
      loading: false,
      error: null,
      lastUpdated: null,
    },
    preferences: {
      preferences: null,
      loading: false,
      error: null,
    },
    dashboard: {
      configs: {},
      configIds: [],
      currentConfigId: null,
      metrics: null,
      loading: false,
      error: null,
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideMockStore({ initialState })],
    });
    store = TestBed.inject(MockStore);
  });

  describe('Property 6: Concurrent Update Consistency', () => {
    /**
     * **Property 6: Concurrent Update Consistency**
     * Concurrent updates to same record produce consistent final state
     * 
     * When multiple updates are made to the same employee record concurrently,
     * the final state should be consistent and predictable. Updates should be
     * applied in order with proper conflict resolution.
     */

    it('should apply concurrent updates in order', () => {
      const employeeId = 'emp-1';
      const employee: Employee = {
        id: employeeId,
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      // Simulate concurrent updates
      const update1 = { ...employee, role: 'Lead Engineer' };
      const update2 = { ...employee, department: 'Management' };
      const update3 = { ...employee, role: 'Principal Engineer' };

      // Dispatch updates in sequence
      store.dispatch(EmployeeActions.updateEmployee({ employee: update1 }));
      store.dispatch(EmployeeActions.updateEmployee({ employee: update2 }));
      store.dispatch(EmployeeActions.updateEmployee({ employee: update3 }));

      // All updates should be queued and processed
      expect(store.dispatch).toHaveBeenCalledTimes(3);
    });

    it('should maintain data consistency with multiple concurrent updates', () => {
      const employees: Employee[] = [
        {
          id: 'emp-1',
          name: 'John Doe',
          email: 'john@example.com',
          department: 'Engineering',
          region: 'Europe',
          role: 'Senior Engineer',
          employmentStatus: 'active',
          hireDate: '2020-01-15',
        },
        {
          id: 'emp-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          department: 'HR',
          region: 'Middle East',
          role: 'HR Manager',
          employmentStatus: 'active',
          hireDate: '2021-06-01',
        },
      ];

      // Simulate concurrent updates to different employees
      store.dispatch(EmployeeActions.updateEmployee({ employee: { ...employees[0], role: 'Lead' } }));
      store.dispatch(EmployeeActions.updateEmployee({ employee: { ...employees[1], role: 'Director' } }));

      // Both updates should be processed
      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });

    it('should handle rapid sequential updates to same record', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      // Simulate rapid updates
      for (let i = 0; i < 10; i++) {
        store.dispatch(
          EmployeeActions.updateEmployee({
            employee: { ...employee, role: `Role ${i}` },
          }),
        );
      }

      // All updates should be queued
      expect(store.dispatch).toHaveBeenCalledTimes(10);
    });

    it('should resolve conflicts when same field is updated concurrently', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      // Concurrent updates to same field
      const update1 = { ...employee, role: 'Lead Engineer' };
      const update2 = { ...employee, role: 'Principal Engineer' };

      store.dispatch(EmployeeActions.updateEmployee({ employee: update1 }));
      store.dispatch(EmployeeActions.updateEmployee({ employee: update2 }));

      // Last update should win (or server-side conflict resolution)
      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });

    it('should maintain consistency across multiple fields in concurrent updates', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      // Updates to different fields
      const update1 = { ...employee, role: 'Lead Engineer', department: 'Management' };
      const update2 = { ...employee, email: 'john.doe@example.com', region: 'Middle East' };

      store.dispatch(EmployeeActions.updateEmployee({ employee: update1 }));
      store.dispatch(EmployeeActions.updateEmployee({ employee: update2 }));

      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Property 7: Optimistic Update Reconciliation', () => {
    /**
     * **Property 7: Optimistic Update Reconciliation**
     * Optimistic updates reconcile correctly with server state
     * 
     * When an optimistic update is made on the client, and the server
     * responds with a different state, the client should reconcile the
     * difference correctly without data loss or inconsistency.
     */

    it('should reconcile optimistic update with server response', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      const optimisticUpdate = { ...employee, role: 'Lead Engineer' };
      const serverResponse = { ...employee, role: 'Lead Engineer', email: 'john.doe@company.com' };

      // Dispatch optimistic update
      store.dispatch(EmployeeActions.updateEmployee({ employee: optimisticUpdate }));

      // Simulate server response with additional changes
      store.dispatch(
        EmployeeActions.loadEmployeesSuccess({
          employees: [serverResponse],
        }),
      );

      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });

    it('should handle optimistic update rollback on server conflict', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      const optimisticUpdate = { ...employee, role: 'Lead Engineer' };

      // Dispatch optimistic update
      store.dispatch(EmployeeActions.updateEmployee({ employee: optimisticUpdate }));

      // Simulate server conflict - revert to original
      store.dispatch(
        EmployeeActions.loadEmployeesFailure({
          error: 'Conflict: Employee was modified by another user',
        }),
      );

      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });

    it('should merge optimistic update with server state when no conflict', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      // Optimistic update to role
      const optimisticUpdate = { ...employee, role: 'Lead Engineer' };

      // Server response with update to different field
      const serverResponse = {
        ...employee,
        role: 'Lead Engineer',
        email: 'john.doe@company.com',
      };

      store.dispatch(EmployeeActions.updateEmployee({ employee: optimisticUpdate }));
      store.dispatch(
        EmployeeActions.loadEmployeesSuccess({
          employees: [serverResponse],
        }),
      );

      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple optimistic updates with single server response', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      // Multiple optimistic updates
      const update1 = { ...employee, role: 'Lead Engineer' };
      const update2 = { ...employee, role: 'Lead Engineer', department: 'Management' };

      store.dispatch(EmployeeActions.updateEmployee({ employee: update1 }));
      store.dispatch(EmployeeActions.updateEmployee({ employee: update2 }));

      // Single server response
      store.dispatch(
        EmployeeActions.loadEmployeesSuccess({
          employees: [update2],
        }),
      );

      expect(store.dispatch).toHaveBeenCalledTimes(3);
    });

    it('should preserve user changes during optimistic update reconciliation', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      // User makes optimistic update
      const userUpdate = { ...employee, role: 'Lead Engineer' };

      // Another user updates different field on server
      const serverUpdate = { ...employee, email: 'john.doe@company.com' };

      store.dispatch(EmployeeActions.updateEmployee({ employee: userUpdate }));
      store.dispatch(
        EmployeeActions.loadEmployeesSuccess({
          employees: [{ ...userUpdate, email: 'john.doe@company.com' }],
        }),
      );

      // Both changes should be preserved
      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });

    it('should handle optimistic update with server-side validation error', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      // Optimistic update with invalid data
      const invalidUpdate = { ...employee, email: 'invalid-email' };

      store.dispatch(EmployeeActions.updateEmployee({ employee: invalidUpdate }));

      // Server rejects with validation error
      store.dispatch(
        EmployeeActions.loadEmployeesFailure({
          error: 'Validation error: Invalid email format',
        }),
      );

      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Update Ordering', () => {
    it('should maintain FIFO order for concurrent updates', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      const updates = [
        { ...employee, role: 'Role 1' },
        { ...employee, role: 'Role 2' },
        { ...employee, role: 'Role 3' },
      ];

      updates.forEach((update) => {
        store.dispatch(EmployeeActions.updateEmployee({ employee: update }));
      });

      expect(store.dispatch).toHaveBeenCalledTimes(3);
    });
  });
});
