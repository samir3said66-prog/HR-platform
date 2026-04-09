import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthorizationService } from './authorization.service';

/**
 * Authorization Service Tests - Validates: Requirements 30.2, 30.3, 30.4
 * 
 * Tests verify:
 * - Unauthorized access is denied
 * - Role-based permissions work correctly
 * - Resource-level authorization works
 */

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, AuthorizationService]
    });

    service = TestBed.inject(AuthorizationService);
    authService = TestBed.inject(AuthService);
  });

  describe('Admin Role', () => {
    beforeEach(() => {
      // Mock admin user
      const adminUser = {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        roles: ['admin']
      };
      localStorage.setItem('hr_analytics_user', JSON.stringify(adminUser));
    });

    it('should allow admin to create users', () => {
      expect(service.canAccess('users', 'create')).toBe(true);
    });

    it('should allow admin to read users', () => {
      expect(service.canAccess('users', 'read')).toBe(true);
    });

    it('should allow admin to update users', () => {
      expect(service.canAccess('users', 'update')).toBe(true);
    });

    it('should allow admin to delete users', () => {
      expect(service.canAccess('users', 'delete')).toBe(true);
    });

    it('should allow admin to configure system', () => {
      expect(service.canAccess('system', 'configure')).toBe(true);
    });

    it('should allow admin to read audit logs', () => {
      expect(service.canAccess('audit', 'read')).toBe(true);
    });

    it('should identify as admin', () => {
      expect(service.isAdmin()).toBe(true);
    });
  });

  describe('HR Manager Role', () => {
    beforeEach(() => {
      const hrManagerUser = {
        id: '2',
        username: 'hr_manager',
        email: 'hr@example.com',
        roles: ['hr_manager']
      };
      localStorage.setItem('hr_analytics_user', JSON.stringify(hrManagerUser));
    });

    it('should allow HR manager to create employees', () => {
      expect(service.canAccess('employees', 'create')).toBe(true);
    });

    it('should allow HR manager to read employees', () => {
      expect(service.canAccess('employees', 'read')).toBe(true);
    });

    it('should allow HR manager to update employees', () => {
      expect(service.canAccess('employees', 'update')).toBe(true);
    });

    it('should deny HR manager from deleting users', () => {
      expect(service.canAccess('users', 'delete')).toBe(false);
    });

    it('should deny HR manager from configuring system', () => {
      expect(service.canAccess('system', 'configure')).toBe(false);
    });

    it('should allow HR manager to export reports', () => {
      expect(service.canAccess('reports', 'export')).toBe(true);
    });

    it('should identify as HR manager', () => {
      expect(service.isHRManager()).toBe(true);
    });
  });

  describe('Department Manager Role', () => {
    beforeEach(() => {
      const deptManagerUser = {
        id: '3',
        username: 'dept_manager',
        email: 'dept@example.com',
        roles: ['department_manager']
      };
      localStorage.setItem('hr_analytics_user', JSON.stringify(deptManagerUser));
    });

    it('should allow department manager to read employees', () => {
      expect(service.canAccess('employees', 'read')).toBe(true);
    });

    it('should deny department manager from creating employees', () => {
      expect(service.canAccess('employees', 'create')).toBe(false);
    });

    it('should deny department manager from updating employees', () => {
      expect(service.canAccess('employees', 'update')).toBe(false);
    });

    it('should deny department manager from deleting employees', () => {
      expect(service.canAccess('employees', 'delete')).toBe(false);
    });

    it('should allow department manager to read reports', () => {
      expect(service.canAccess('reports', 'read')).toBe(true);
    });

    it('should deny department manager from creating reports', () => {
      expect(service.canAccess('reports', 'create')).toBe(false);
    });

    it('should identify as department manager', () => {
      expect(service.isDepartmentManager()).toBe(true);
    });
  });

  describe('Analyst Role', () => {
    beforeEach(() => {
      const analystUser = {
        id: '4',
        username: 'analyst',
        email: 'analyst@example.com',
        roles: ['analyst']
      };
      localStorage.setItem('hr_analytics_user', JSON.stringify(analystUser));
    });

    it('should allow analyst to read employees', () => {
      expect(service.canAccess('employees', 'read')).toBe(true);
    });

    it('should allow analyst to create reports', () => {
      expect(service.canAccess('reports', 'create')).toBe(true);
    });

    it('should allow analyst to export reports', () => {
      expect(service.canAccess('reports', 'export')).toBe(true);
    });

    it('should deny analyst from creating employees', () => {
      expect(service.canAccess('employees', 'create')).toBe(false);
    });

    it('should deny analyst from deleting employees', () => {
      expect(service.canAccess('employees', 'delete')).toBe(false);
    });

    it('should identify as analyst', () => {
      expect(service.isAnalyst()).toBe(true);
    });
  });

  describe('Employee Role', () => {
    beforeEach(() => {
      const employeeUser = {
        id: '5',
        username: 'employee',
        email: 'employee@example.com',
        roles: ['employee']
      };
      localStorage.setItem('hr_analytics_user', JSON.stringify(employeeUser));
    });

    it('should allow employee to read own profile', () => {
      expect(service.canAccess('employees', 'read')).toBe(true);
    });

    it('should allow employee to read own performance', () => {
      expect(service.canAccess('performance', 'read')).toBe(true);
    });

    it('should deny employee from creating employees', () => {
      expect(service.canAccess('employees', 'create')).toBe(false);
    });

    it('should deny employee from updating employees', () => {
      expect(service.canAccess('employees', 'update')).toBe(false);
    });

    it('should deny employee from deleting employees', () => {
      expect(service.canAccess('employees', 'delete')).toBe(false);
    });

    it('should deny employee from creating reports', () => {
      expect(service.canAccess('reports', 'create')).toBe(false);
    });

    it('should identify as employee', () => {
      expect(service.isEmployee()).toBe(true);
    });
  });

  describe('Permission Helpers', () => {
    beforeEach(() => {
      const hrManagerUser = {
        id: '2',
        username: 'hr_manager',
        email: 'hr@example.com',
        roles: ['hr_manager']
      };
      localStorage.setItem('hr_analytics_user', JSON.stringify(hrManagerUser));
    });

    it('should check if user can view resource', () => {
      expect(service.canView('employees')).toBe(true);
    });

    it('should check if user can create resource', () => {
      expect(service.canCreate('employees')).toBe(true);
    });

    it('should check if user can edit resource', () => {
      expect(service.canEdit('employees')).toBe(true);
    });

    it('should check if user can delete resource', () => {
      expect(service.canDelete('employees')).toBe(false);
    });

    it('should check if user can export resource', () => {
      expect(service.canExport('reports')).toBe(true);
    });

    it('should check if user can access any action', () => {
      expect(service.canAccessAny('employees', ['create', 'delete'])).toBe(true);
    });

    it('should check if user can access all actions', () => {
      expect(service.canAccessAll('employees', ['create', 'read'])).toBe(true);
      expect(service.canAccessAll('employees', ['create', 'delete'])).toBe(false);
    });
  });

  describe('Unauthorized Access', () => {
    beforeEach(() => {
      const employeeUser = {
        id: '5',
        username: 'employee',
        email: 'employee@example.com',
        roles: ['employee']
      };
      localStorage.setItem('hr_analytics_user', JSON.stringify(employeeUser));
    });

    it('should deny unauthorized access to user management', () => {
      expect(service.canAccess('users', 'create')).toBe(false);
      expect(service.canAccess('users', 'read')).toBe(false);
      expect(service.canAccess('users', 'update')).toBe(false);
      expect(service.canAccess('users', 'delete')).toBe(false);
    });

    it('should deny unauthorized access to system configuration', () => {
      expect(service.canAccess('system', 'configure')).toBe(false);
    });

    it('should deny unauthorized access to audit logs', () => {
      expect(service.canAccess('audit', 'read')).toBe(false);
    });

    it('should deny unauthorized access to employee deletion', () => {
      expect(service.canAccess('employees', 'delete')).toBe(false);
    });
  });

  describe('No User', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should deny access when no user is logged in', () => {
      expect(service.canAccess('employees', 'read')).toBe(false);
    });

    it('should return empty permissions when no user', () => {
      expect(service.getUserPermissions()).toEqual([]);
    });

    it('should not identify as any role', () => {
      expect(service.isAdmin()).toBe(false);
      expect(service.isHRManager()).toBe(false);
      expect(service.isDepartmentManager()).toBe(false);
      expect(service.isAnalyst()).toBe(false);
      expect(service.isEmployee()).toBe(false);
    });
  });
});
