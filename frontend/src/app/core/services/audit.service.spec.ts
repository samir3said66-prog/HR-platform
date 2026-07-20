import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AuditService, AuditLog } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;
  let authService: AuthService;
  let httpMock: HttpTestingController;

  const mockUser = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    roles: ['admin']
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('hr_analytics_user', JSON.stringify(mockUser));

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        AuthService,
        AuditService
      ]
    });

    service = TestBed.inject(AuditService);
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    // Clear any calls made during constructor (like queue processing)
    const pending = httpMock.match('/api/audit/log');
    pending.forEach(req => req.flush({}));
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Log Action', () => {
    it('should log user action', () => {
      service.logAction('view', 'employees', 'Viewed employee list');

      const req = httpMock.expectOne('/api/audit/log');
      expect(req.request.method).toBe('POST');

      const auditLog = req.request.body as AuditLog;
      expect(auditLog.action).toBe('view');
      expect(auditLog.resource).toBe('employees');
      expect(auditLog.userId).toBe('1');
      expect(auditLog.username).toBe('testuser');
      expect(auditLog.status).toBe('success');

      req.flush({});
    });

    it('should include timestamp in audit log', () => {
      const beforeTime = new Date();
      service.logAction('view', 'employees', 'Viewed employee list');
      const afterTime = new Date();

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      const logTime = new Date(auditLog.timestamp);
      expect(logTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime() - 1000); // Buffer for precision
      expect(logTime.getTime()).toBeLessThanOrEqual(afterTime.getTime() + 1000);

      req.flush({});
    });
  });

  describe('Log Failed Action', () => {
    it('should log failed action', () => {
      service.logFailedAction('delete', 'employees', 'Failed to delete employee', 'Permission denied', 'emp-123');

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.action).toBe('delete');
      expect(auditLog.status).toBe('failure');
      expect(auditLog.errorMessage).toBe('Permission denied');

      req.flush({});
    });
  });

  describe('Retrieve Audit Logs', () => {
    it('should get audit logs', async () => {
      const logsPromise = firstValueFrom(service.getAuditLogs());

      const req = httpMock.expectOne('/api/audit/logs');
      expect(req.request.method).toBe('POST');
      req.flush([]);

      const logs = await logsPromise;
      expect(logs).toBeDefined();
    });
  });

  describe('Audit Log Queue', () => {
    it('should queue log if send fails', () => {
      service.logAction('view', 'employees', 'Viewed employee list');

      const req = httpMock.expectOne('/api/audit/log');
      req.error(new ErrorEvent('Network error'));

      const queued = localStorage.getItem('audit_logs_queue');
      expect(queued).toContain('view');
    });
  });
});
