import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService, LoginRequest, LoginResponse } from './auth.service';

/**
 * Authentication Service Tests - Validates: Requirements 30.1, 30.5
 * 
 * Tests verify:
 * - Login works with valid credentials
 * - Tokens are stored securely
 * - Session timeout works
 * - Logout clears session
 */

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const mockLoginResponse: LoginResponse = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.signature',
    refreshToken: 'refresh-token-123',
    expiresIn: 3600,
    user: {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      roles: ['admin']
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, Router]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Login', () => {
    it('should login with valid credentials', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      };

      const loginPromise = firstValueFrom(service.login(credentials));

      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockLoginResponse);

      const response = await loginPromise;
      expect(response.token).toBe(mockLoginResponse.token);
      expect(response.user.username).toBe('testuser');
    });

    it('should store token after successful login', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      };

      const loginPromise = firstValueFrom(service.login(credentials));

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockLoginResponse);

      await loginPromise;
      expect(localStorage.getItem('hr_analytics_token')).toBe(mockLoginResponse.token);
      expect(localStorage.getItem('hr_analytics_refresh_token')).toBe(mockLoginResponse.refreshToken);
    });

    it('should set current user after successful login', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      };

      const loginPromise = firstValueFrom(service.login(credentials));

      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockLoginResponse);

      await loginPromise;
      const user = service.getCurrentUser();
      expect(user).toBeDefined();
      expect(user?.username).toBe('testuser');
      expect(user?.roles).toContain('admin');
    });

    it('should handle login failure', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'wrongpassword'
      };

      const loginPromise = firstValueFrom(service.login(credentials));

      const req = httpMock.expectOne('/api/auth/login');
      req.error(new ErrorEvent('Unauthorized'), { status: 401 });

      try {
        await loginPromise;
        expect.fail('Should have failed');
      } catch (error: any) {
        expect(error.message).toContain('Login failed');
      }
    });
  });

  describe('Logout', () => {
    it('should clear tokens on logout', () => {
      localStorage.setItem('hr_analytics_token', 'test-token');
      localStorage.setItem('hr_analytics_refresh_token', 'test-refresh-token');

      service.logout();

      expect(localStorage.getItem('hr_analytics_token')).toBeNull();
      expect(localStorage.getItem('hr_analytics_refresh_token')).toBeNull();
    });

    it('should clear current user on logout', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      };

      const loginPromise = firstValueFrom(service.login(credentials));
      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockLoginResponse);
      await loginPromise;

      expect(service.getCurrentUser()).toBeDefined();

      service.logout();

      expect(service.getCurrentUser()).toBeNull();
    });

    it('should navigate to login on logout', () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      service.logout();

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Token Management', () => {
    it('should get token', () => {
      const token = 'test-token-123';
      localStorage.setItem('hr_analytics_token', token);

      expect(service.getToken()).toBe(token);
    });

    it('should return null if no token', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should refresh token', async () => {
      localStorage.setItem('hr_analytics_refresh_token', 'refresh-token-123');

      const newResponse: LoginResponse = {
        ...mockLoginResponse,
        token: 'new-token-456'
      };

      const refreshPromise = firstValueFrom(service.refreshToken());

      const req = httpMock.expectOne('/api/auth/refresh');
      expect(req.request.method).toBe('POST');
      req.flush(newResponse);

      const response = await refreshPromise;
      expect(response.token).toBe('new-token-456');
      expect(localStorage.getItem('hr_analytics_token')).toBe('new-token-456');
    });
  });

  describe('Authentication Status', () => {
    it('should return true if authenticated', async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      };

      const loginPromise = firstValueFrom(service.login(credentials));
      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockLoginResponse);
      await loginPromise;

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false if not authenticated', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('Role Management', () => {
    beforeEach(async () => {
      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      };

      const loginPromise = firstValueFrom(service.login(credentials));
      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockLoginResponse);
      await loginPromise;
    });

    it('should check if user has role', () => {
      expect(service.hasRole('admin')).toBe(true);
      expect(service.hasRole('user')).toBe(false);
    });

    it('should check if user has any role', () => {
      expect(service.hasAnyRole(['admin', 'user'])).toBe(true);
      expect(service.hasAnyRole(['user', 'guest'])).toBe(false);
    });

    it('should check if user has all roles', () => {
      expect(service.hasAllRoles(['admin'])).toBe(true);
      expect(service.hasAllRoles(['admin', 'user'])).toBe(false);
    });
  });

  describe('Session Timeout', () => {
    it('should logout on session timeout', async () => {
      vi.useFakeTimers();

      const credentials: LoginRequest = {
        username: 'testuser',
        password: 'password123'
      };

      const loginPromise = firstValueFrom(service.login(credentials));
      const req = httpMock.expectOne('/api/auth/login');
      req.flush(mockLoginResponse);
      await loginPromise;

      expect(service.isAuthenticated()).toBe(true);

      // Fast-forward 30 minutes
      vi.advanceTimersByTime(30 * 60 * 1000);

      // Session should be cleared
      expect(service.isAuthenticated()).toBe(false);

      vi.useRealTimers();
    });
  });
});
