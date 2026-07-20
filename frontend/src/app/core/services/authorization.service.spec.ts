import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';
import { AuthorizationService } from './authorization.service';

/**
 * Authorization Service Tests
 * 
 * Validates: Requirements 30.2, 30.3, 30.4
 */
describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let mockAuthService: any;

  beforeEach(() => {
    mockAuthService = {
      getCurrentUser: vi.fn(),
      hasRole: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthorizationService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(AuthorizationService);
  });

  describe('Admin Role', () => {
    beforeEach(() => {
      const adminUser = {
        roles: ['admin']
      };
      mockAuthService.getCurrentUser.mockReturnValue(adminUser);
      mockAuthService.hasRole.mockImplementation((role: string) => role === 'admin');
    });

    it('should allow admin to read users', () => {
      expect(service.canAccess('users', 'read')).toBe(true);
    });

    it('should identify as admin', () => {
      expect(service.isAdmin()).toBe(true);
    });
  });

  describe('HR Manager Role', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.mockReturnValue({ roles: ['hr_manager'] });
      mockAuthService.hasRole.mockImplementation((role: string) => role === 'hr_manager');
    });

    it('should allow HR manager to create employees', () => {
      expect(service.canAccess('employees', 'create')).toBe(true);
    });

    it('should deny HR manager from configuring system', () => {
      expect(service.canAccess('system', 'configure')).toBe(false);
    });
  });

  describe('No User', () => {
    beforeEach(() => {
      mockAuthService.getCurrentUser.mockReturnValue(null);
      mockAuthService.hasRole.mockReturnValue(false);
    });

    it('should deny access when no user is logged in', () => {
      expect(service.canAccess('employees', 'read')).toBe(false);
    });

    it('should not identify as any role', () => {
      expect(service.isAdmin()).toBe(false);
      expect(service.isHRManager()).toBe(false);
    });
  });
});
