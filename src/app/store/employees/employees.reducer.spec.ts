import { employeeReducer } from './employees.reducer';
import { initialEmployeeState, Employee } from './employees.state';
import * as EmployeeActions from './employees.actions';
import { describe, it, expect } from 'vitest';

/**
 * Unit Tests: Employee Reducer
 * Requirements: 12.1, 12.2, 28.1
 */

const mockEmployee1: Employee = {
  id: '1',
  name: 'Alice Johnson',
  email: 'alice@hr.com',
  department: 'Engineering',
  region: 'Europe',
  role: 'Senior Engineer',
  employmentStatus: 'active',
  hireDate: '2020-01-15',
  performanceScore: 88,
};

const mockEmployee2: Employee = {
  id: '2',
  name: 'Bader Al-Rashid',
  email: 'bader@hr.com',
  department: 'Sales',
  region: 'Middle East',
  role: 'Sales Manager',
  employmentStatus: 'active',
  hireDate: '2019-06-20',
  performanceScore: 76,
};

describe('employeeReducer', () => {
  it('should return the initial state by default', () => {
    const state = employeeReducer(undefined, { type: '@@INIT' } as any);
    expect(state).toEqual(initialEmployeeState);
  });

  describe('loadEmployees', () => {
    it('should set loading to true and clear error', () => {
      const state = employeeReducer(
        { ...initialEmployeeState, error: 'previous error' },
        EmployeeActions.loadEmployees(),
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('loadEmployeesSuccess', () => {
    it('should populate entities and ids from payload', () => {
      const employees = [mockEmployee1, mockEmployee2];
      const state = employeeReducer(
        { ...initialEmployeeState, loading: true },
        EmployeeActions.loadEmployeesSuccess({ employees }),
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.ids).toEqual(['1', '2']);
      expect(state.entities['1']).toEqual(mockEmployee1);
      expect(state.entities['2']).toEqual(mockEmployee2);
    });

    it('should replace existing entities on re-load', () => {
      const initial = employeeReducer(
        initialEmployeeState,
        EmployeeActions.loadEmployeesSuccess({ employees: [mockEmployee1] }),
      );
      const updated = employeeReducer(
        initial,
        EmployeeActions.loadEmployeesSuccess({ employees: [mockEmployee2] }),
      );
      expect(updated.ids).toEqual(['2']);
      expect(updated.entities['1']).toBeUndefined();
    });
  });

  describe('loadEmployeesFailure', () => {
    it('should set loading to false and store error message', () => {
      const state = employeeReducer(
        { ...initialEmployeeState, loading: true },
        EmployeeActions.loadEmployeesFailure({ error: 'Network error' }),
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Network error');
    });
  });

  describe('addEmployee', () => {
    it('should add a new employee to entities and ids', () => {
      const state = employeeReducer(
        initialEmployeeState,
        EmployeeActions.addEmployee({ employee: mockEmployee1 }),
      );
      expect(state.ids).toContain('1');
      expect(state.entities['1']).toEqual(mockEmployee1);
    });

    it('should add multiple employees cumulatively', () => {
      let state = employeeReducer(
        initialEmployeeState,
        EmployeeActions.addEmployee({ employee: mockEmployee1 }),
      );
      state = employeeReducer(state, EmployeeActions.addEmployee({ employee: mockEmployee2 }));
      expect(state.ids).toHaveLength(2);
      expect(state.entities['2']).toEqual(mockEmployee2);
    });
  });

  describe('updateEmployee', () => {
    it('should update an existing employee by id', () => {
      const initial = employeeReducer(
        initialEmployeeState,
        EmployeeActions.addEmployee({ employee: mockEmployee1 }),
      );
      const updated = { ...mockEmployee1, performanceScore: 95, role: 'Lead Engineer' };
      const state = employeeReducer(initial, EmployeeActions.updateEmployee({ employee: updated }));
      expect(state.entities['1']?.performanceScore).toBe(95);
      expect(state.entities['1']?.role).toBe('Lead Engineer');
    });

    it('should not change ids array on update', () => {
      const initial = employeeReducer(
        initialEmployeeState,
        EmployeeActions.addEmployee({ employee: mockEmployee1 }),
      );
      const updated = { ...mockEmployee1, name: 'Alice Updated' };
      const state = employeeReducer(initial, EmployeeActions.updateEmployee({ employee: updated }));
      expect(state.ids).toHaveLength(1);
    });
  });

  describe('deleteEmployee', () => {
    it('should remove employee from entities and ids', () => {
      let state = employeeReducer(
        initialEmployeeState,
        EmployeeActions.addEmployee({ employee: mockEmployee1 }),
      );
      state = employeeReducer(state, EmployeeActions.deleteEmployee({ id: '1' }));
      expect(state.ids).not.toContain('1');
      expect(state.entities['1']).toBeUndefined();
    });

    it('should leave other employees intact', () => {
      let state = employeeReducer(
        initialEmployeeState,
        EmployeeActions.loadEmployeesSuccess({ employees: [mockEmployee1, mockEmployee2] }),
      );
      state = employeeReducer(state, EmployeeActions.deleteEmployee({ id: '1' }));
      expect(state.ids).toEqual(['2']);
      expect(state.entities['2']).toEqual(mockEmployee2);
    });

    it('should be a no-op if id does not exist', () => {
      const initial = employeeReducer(
        initialEmployeeState,
        EmployeeActions.addEmployee({ employee: mockEmployee1 }),
      );
      const state = employeeReducer(initial, EmployeeActions.deleteEmployee({ id: 'non-existent' }));
      expect(state.ids).toHaveLength(1);
    });
  });

  describe('selectEmployee / clearSelectedEmployee', () => {
    it('should set selectedEmployeeId', () => {
      const state = employeeReducer(
        initialEmployeeState,
        EmployeeActions.selectEmployee({ id: '1' }),
      );
      expect(state.selectedEmployeeId).toBe('1');
    });

    it('should clear selectedEmployeeId', () => {
      const withSelected = employeeReducer(
        initialEmployeeState,
        EmployeeActions.selectEmployee({ id: '1' }),
      );
      const cleared = employeeReducer(withSelected, EmployeeActions.clearSelectedEmployee());
      expect(cleared.selectedEmployeeId).toBeNull();
    });
  });
});
