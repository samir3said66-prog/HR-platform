import { createSelector } from '@ngrx/store';
import {
  selectAllEmployees,
  selectEmployeeById,
  selectEmployeeEntities,
  selectEmployeeError,
  selectEmployeeIds,
  selectEmployeeLoading,
  selectEmployeesByDepartment,
  selectEmployeesByRegion,
  selectEmployeesByStatus,
  selectSelectedEmployee,
  selectSelectedEmployeeId,
} from './employees.selectors';
import { EmployeeState } from './employees.state';
import { describe, it, expect } from 'vitest';

/**
 * Unit Tests: Employee Selectors
 * Requirements: 12.2, 28.1
 */

const mockState: EmployeeState = {
  ids: ['1', '2', '3'],
  entities: {
    '1': {
      id: '1',
      name: 'Alice Johnson',
      email: 'alice@hr.com',
      department: 'Engineering',
      region: 'Europe',
      role: 'Senior Engineer',
      employmentStatus: 'active',
      hireDate: '2020-01-15',
      performanceScore: 88,
    },
    '2': {
      id: '2',
      name: 'Bader Al-Rashid',
      email: 'bader@hr.com',
      department: 'Sales',
      region: 'Middle East',
      role: 'Sales Manager',
      employmentStatus: 'active',
      hireDate: '2019-06-20',
      performanceScore: 76,
    },
    '3': {
      id: '3',
      name: 'Carol Smith',
      email: 'carol@hr.com',
      department: 'Engineering',
      region: 'Europe',
      role: 'Junior Engineer',
      employmentStatus: 'on-leave',
      hireDate: '2021-03-10',
      performanceScore: 71,
    },
  },
  loading: false,
  error: null,
  selectedEmployeeId: '2',
};

const mockRootState = { employees: mockState };

describe('Employee Selectors', () => {
  describe('selectAllEmployees', () => {
    it('should return all employees as an array in order of ids', () => {
      const result = selectAllEmployees(mockRootState as any);
      expect(result).toHaveLength(3);
      expect(result[0]?.id).toBe('1');
      expect(result[1]?.id).toBe('2');
      expect(result[2]?.id).toBe('3');
    });

    it('should return empty array when no employees exist', () => {
      const emptyState = { employees: { ...mockState, ids: [], entities: {} } };
      const result = selectAllEmployees(emptyState as any);
      expect(result).toEqual([]);
    });
  });

  describe('selectEmployeeIds', () => {
    it('should return array of employee ids', () => {
      const result = selectEmployeeIds(mockRootState as any);
      expect(result).toEqual(['1', '2', '3']);
    });
  });

  describe('selectEmployeeEntities', () => {
    it('should return entities dictionary', () => {
      const result = selectEmployeeEntities(mockRootState as any);
      expect(Object.keys(result)).toHaveLength(3);
      expect(result['1']?.name).toBe('Alice Johnson');
    });
  });

  describe('selectEmployeeLoading', () => {
    it('should return false when not loading', () => {
      expect(selectEmployeeLoading(mockRootState as any)).toBe(false);
    });

    it('should return true when loading', () => {
      const loadingState = { employees: { ...mockState, loading: true } };
      expect(selectEmployeeLoading(loadingState as any)).toBe(true);
    });
  });

  describe('selectEmployeeError', () => {
    it('should return null when no error', () => {
      expect(selectEmployeeError(mockRootState as any)).toBeNull();
    });

    it('should return error string when error exists', () => {
      const errorState = { employees: { ...mockState, error: 'API failure' } };
      expect(selectEmployeeError(errorState as any)).toBe('API failure');
    });
  });

  describe('selectSelectedEmployeeId', () => {
    it('should return the selected employee id', () => {
      expect(selectSelectedEmployeeId(mockRootState as any)).toBe('2');
    });

    it('should return null when none selected', () => {
      const noSelState = { employees: { ...mockState, selectedEmployeeId: null } };
      expect(selectSelectedEmployeeId(noSelState as any)).toBeNull();
    });
  });

  describe('selectSelectedEmployee', () => {
    it('should return the selected employee object', () => {
      const result = selectSelectedEmployee(mockRootState as any);
      expect(result?.name).toBe('Bader Al-Rashid');
    });

    it('should return null when no employee is selected', () => {
      const noSelState = { employees: { ...mockState, selectedEmployeeId: null } };
      const result = selectSelectedEmployee(noSelState as any);
      expect(result).toBeNull();
    });
  });

  describe('selectEmployeeById', () => {
    it('should return correct employee for a given id', () => {
      const selector = selectEmployeeById('1');
      const result = selector(mockRootState as any);
      expect(result?.name).toBe('Alice Johnson');
    });

    it('should return undefined for a non-existent id', () => {
      const selector = selectEmployeeById('999');
      const result = selector(mockRootState as any);
      expect(result).toBeUndefined();
    });
  });

  describe('selectEmployeesByDepartment', () => {
    it('should return only employees in the specified department', () => {
      const selector = selectEmployeesByDepartment('Engineering');
      const result = selector(mockRootState as any);
      expect(result).toHaveLength(2);
      expect(result.every((e) => e?.department === 'Engineering')).toBe(true);
    });

    it('should return empty array for unknown department', () => {
      const selector = selectEmployeesByDepartment('Finance');
      const result = selector(mockRootState as any);
      expect(result).toHaveLength(0);
    });
  });

  describe('selectEmployeesByRegion', () => {
    it('should return employees filtered by region', () => {
      const selector = selectEmployeesByRegion('Middle East');
      const result = selector(mockRootState as any);
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Bader Al-Rashid');
    });
  });

  describe('selectEmployeesByStatus', () => {
    it('should return active employees', () => {
      const selector = selectEmployeesByStatus('active');
      const result = selector(mockRootState as any);
      expect(result).toHaveLength(2);
    });

    it('should return on-leave employees', () => {
      const selector = selectEmployeesByStatus('on-leave');
      const result = selector(mockRootState as any);
      expect(result).toHaveLength(1);
      expect(result[0]?.name).toBe('Carol Smith');
    });

    it('should return empty array for departed (none in state)', () => {
      const selector = selectEmployeesByStatus('departed');
      const result = selector(mockRootState as any);
      expect(result).toHaveLength(0);
    });
  });
});
