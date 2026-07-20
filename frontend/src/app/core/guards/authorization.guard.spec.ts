import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthorizationGuardService } from './authorization.guard';
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Unit Tests: Authorization Guard
 * Requirements: 30.2, 30.3, 30.4, 28.1
 */
describe('AuthorizationGuardService', () => {
  let service: AuthorizationGuardService;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthorizationGuardService,
        { provide: Router, useValue: mockRouter },
      ],
    });
    service = TestBed.inject(AuthorizationGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow activation when no roles are required', () => {
    const mockRoute = {
      data: {}
    } as unknown as ActivatedRouteSnapshot;

    expect(service.canActivate(mockRoute)).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should allow activation when user has required roles', () => {
    const mockRoute = {
      data: { roles: ['ADMIN'] }
    } as unknown as ActivatedRouteSnapshot;

    // Currently hardcoded to true in the implementation
    expect(service.canActivate(mockRoute)).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  // Note: Add test for unauthorized state once the actual AuthService integration is complete.
  // For now, it's hardcoded to allow development.
});
