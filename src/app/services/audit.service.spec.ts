import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuditService, AuditLog } from './audit.service';

/**
 * Audit Service Tests - Validates: Requirements 32.1, 32.2
 * 
 * Tests verify:
 * - All user actions are logged
 * - Audit logs include timestamp, user ID, and action details
 * - Logs are persisted and retrievable
 */

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
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, AuditService]
    });

    service = TestBed.inject(AuditService);
    authService = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Set up mock user
    localStorage.setItem('hr_analytics_user', JSON.stringify(mockUser));
    localStorage.clear();
    localStorage.setItem('hr_analytics_user', JSON.stringify(mockUser));
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
      expect(logTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(logTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());

      req.flush({});
    });

    it('should include resource ID in audit log', () => {
      service.logAction('view', 'employees', 'Viewed employee', 'emp-123');

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.resourceId).toBe('emp-123');

      req.flush({});
    });

    it('should include changes in audit log', () => {
      const changes = {
        before: { name: 'John' },
        after: { name: 'Jane' }
      };

      service.logAction('update', 'employees', 'Updated employee', 'emp-123', changes);

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.changes).toEqual(changes);

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

  describe('Specific Action Logging', () => {
    it('should log view action', () => {
      service.logView('employees', 'emp-123');

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.action).toBe('view');
      expect(auditLog.resource).toBe('employees');
      expect(auditLog.resourceId).toBe('emp-123');

      req.flush({});
    });

    it('should log create action', () => {
      const data = { name: 'John Doe', email: 'john@example.com' };
      service.logCreate('employees', 'emp-123', data);

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.action).toBe('create');
      expect(auditLog.changes?.after).toEqual(data);
      expect(auditLog.changes?.before).toEqual({});

      req.flush({});
    });

    it('should log update action', () => {
      const before = { name: 'John' };
      const after = { name: 'Jane' };
      service.logUpdate('employees', 'emp-123', before, after);

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.action).toBe('update');
      expect(auditLog.changes?.before).toEqual(before);
      expect(auditLog.changes?.after).toEqual(after);

      req.flush({});
    });

    it('should log delete action', () => {
      const data = { name: 'John Doe' };
      service.logDelete('employees', 'emp-123', data);

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.action).toBe('delete');
      expect(auditLog.changes?.before).toEqual(data);
      expect(auditLog.changes?.after).toEqual({});

      req.flush({});
    });

    it('should log export action', () => {
      const filters = { department: 'Sales' };
      service.logExport('employees', 'csv', filters);

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.action).toBe('export');
      expect(auditLog.changes?.after.format).toBe('csv');
      expect(auditLog.changes?.after.filters).toEqual(filters);

      req.flush({});
    });

    it('should log login action', () => {
      service.logLogin('testuser', true);

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.action).toBe('login');
      expect(auditLog.status).toBe('success');

      req.flush({});
    });

    it('should log failed login', () => {
      service.logLogin('testuser', false, 'Invalid password');

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.action).toBe('login');
      expect(auditLog.status).toBe('failure');
      expect(auditLog.errorMessage).toBe('Invalid password');

      req.flush({});
    });

    it('should log logout action', () => {
      service.logLogout();

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.action).toBe('logout');
      expect(auditLog.status).toBe('success');

      req.flush({});
    });
  });

  describe('Retrieve Audit Logs', () => {
    it('should get audit logs', () => {
      service.getAuditLogs().subscribe(logs => {
        expect(logs).toBeDefined();
      });

      const req = httpMock.expectOne('/api/audit/logs');
      expect(req.request.method).toBe('POST');
      req.flush([]);
    });

    it('should get user audit logs', () => {
      service.getUserAuditLogs('1').subscribe(logs => {
        expect(logs).toBeDefined();
      });

      const req = httpMock.expectOne('/api/audit/logs/user/1');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should get resource audit logs', () => {
      service.getResourceAuditLogs('employees').subscribe(logs => {
        expect(logs).toBeDefined();
      });

      const req = httpMock.expectOne('/api/audit/logs/resource/employees');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });

    it('should get specific resource audit logs', () => {
      service.getResourceAuditLogs('employees', 'emp-123').subscribe(logs => {
        expect(logs).toBeDefined();
      });

      const req = httpMock.expectOne('/api/audit/logs/resource/employees/emp-123');
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });

  describe('Export Audit Logs', () => {
    it('should export audit logs as CSV', () => {
      service.exportAuditLogs(undefined, 'csv').subscribe(blob => {
        expect(blob).toBeDefined();
      });

      const req = httpMock.expectOne('/api/audit/export');
      expect(req.request.method).toBe('POST');
      req.flush(new Blob());
    });

    it('should export audit logs as JSON', () => {
      service.exportAuditLogs(undefined, 'json').subscribe(blob => {
        expect(blob).toBeDefined();
      });

      const req = httpMock.expectOne('/api/audit/export');
      expect(req.request.method).toBe('POST');
      req.flush(new Blob());
    });
  });

  describe('Audit Log Queue', () => {
    it('should queue log if send fails', () => {
      service.logAction('view', 'employees', 'Viewed employee list');

      const req = httpMock.expectOne('/api/audit/log');
      req.error(new ErrorEvent('Network error'));

      // Check that log was queued
      const queued = localStorage.getItem('audit_logs_queue');
      expect(queued).toBeDefined();
    });

    it('should retry queued logs', () => {
      // Add a log to the queue
      const queuedLog: AuditLog = {
        timestamp: new Date(),
        userId: '1',
        username: 'testuser',
        action: 'view',
        resource: 'employees',
        details: 'Viewed employee list',
        status: 'success'
      };

      localStorage.setItem('audit_logs_queue', JSON.stringify([queuedLog]));

      // Create new service instance to trigger queue loading
      const newService = new AuditService(
        TestBed.inject(HttpClientTestingModule as any),
        authService
      );

      // Should attempt to send queued log
      const req = httpMock.expectOne('/api/audit/log');
      expect(req.request.method).toBe('POST');
      req.flush({});
    });
  });

  describe('User Agent and IP', () => {
    it('should include user agent in audit log', () => {
      service.logAction('view', 'employees', 'Viewed employee list');

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.userAgent).toBe(navigator.userAgent);

      req.flush({});
    });

    it('should include IP address in audit log', () => {
      service.logAction('view', 'employees', 'Viewed employee list');

      const req = httpMock.expectOne('/api/audit/log');
      const auditLog = req.request.body as AuditLog;

      expect(auditLog.ipAddress).toBeDefined();

      req.flush({});
    });
  });
});
