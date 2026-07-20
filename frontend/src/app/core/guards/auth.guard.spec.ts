import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthGuardService, authGuard } from './auth.guard';
import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Unit Tests: Auth Guard
 * Requirements: 30.1, 30.2, 30.3, 28.1
 */
describe('AuthGuard', () => {
  let service: AuthGuardService;
  let mockRouter: any;

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthGuardService,
        { provide: Router, useValue: mockRouter },
      ],
    });
    service = TestBed.inject(AuthGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should allow activation when authenticated', () => {
    // Currently hardcoded to true in the implementation
    expect(service.canActivate()).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  // Note: Add test for unauthenticated state once the actual AuthService integration is complete.
  // For now, it's hardcoded to allow development.
});
