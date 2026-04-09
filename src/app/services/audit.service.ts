import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Audit Logging Service - Validates: Requirements 32.1, 32.2
 * 
 * Logs all user actions with:
 * - Timestamp
 * - User ID
 * - Action details
 * - Resource affected
 * - Changes made
 * - 7-year retention policy
 */

export interface AuditLog {
  id?: string;
  timestamp: Date;
  userId: string;
  username: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  changes?: {
    before: any;
    after: any;
  };
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

export interface AuditLogFilter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
  action?: string;
  resource?: string;
  status?: 'success' | 'failure';
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  private readonly API_URL = '/api/audit';
  private readonly LOCAL_STORAGE_KEY = 'audit_logs_queue';
  private auditQueue: AuditLog[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.loadQueueFromStorage();
  }

  /**
   * Log user action
   */
  logAction(
    action: string,
    resource: string,
    details: string,
    resourceId?: string,
    changes?: { before: any; after: any }
  ): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const auditLog: AuditLog = {
      timestamp: new Date(),
      userId: user.id,
      username: user.username,
      action,
      resource,
      resourceId,
      details,
      changes,
      ipAddress: this.getClientIpAddress(),
      userAgent: navigator.userAgent,
      status: 'success'
    };

    this.sendAuditLog(auditLog);
  }

  /**
   * Log failed action
   */
  logFailedAction(
    action: string,
    resource: string,
    details: string,
    errorMessage: string,
    resourceId?: string
  ): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const auditLog: AuditLog = {
      timestamp: new Date(),
      userId: user.id,
      username: user.username,
      action,
      resource,
      resourceId,
      details,
      ipAddress: this.getClientIpAddress(),
      userAgent: navigator.userAgent,
      status: 'failure',
      errorMessage
    };

    this.sendAuditLog(auditLog);
  }

  /**
   * Log view action
   */
  logView(resource: string, resourceId?: string): void {
    this.logAction('view', resource, `Viewed ${resource}`, resourceId);
  }

  /**
   * Log create action
   */
  logCreate(resource: string, resourceId: string, data: any): void {
    this.logAction('create', resource, `Created ${resource}`, resourceId, {
      before: {},
      after: data
    });
  }

  /**
   * Log update action
   */
  logUpdate(resource: string, resourceId: string, before: any, after: any): void {
    this.logAction('update', resource, `Updated ${resource}`, resourceId, {
      before,
      after
    });
  }

  /**
   * Log delete action
   */
  logDelete(resource: string, resourceId: string, data: any): void {
    this.logAction('delete', resource, `Deleted ${resource}`, resourceId, {
      before: data,
      after: {}
    });
  }

  /**
   * Log export action
   */
  logExport(resource: string, format: string, filters?: any): void {
    this.logAction('export', resource, `Exported ${resource} as ${format}`, undefined, {
      before: {},
      after: { format, filters }
    });
  }

  /**
   * Log login action
   */
  logLogin(username: string, success: boolean, errorMessage?: string): void {
    const auditLog: AuditLog = {
      timestamp: new Date(),
      userId: 'unknown',
      username,
      action: 'login',
      resource: 'authentication',
      details: `Login attempt for user ${username}`,
      ipAddress: this.getClientIpAddress(),
      userAgent: navigator.userAgent,
      status: success ? 'success' : 'failure',
      errorMessage
    };

    this.sendAuditLog(auditLog);
  }

  /**
   * Log logout action
   */
  logLogout(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    const auditLog: AuditLog = {
      timestamp: new Date(),
      userId: user.id,
      username: user.username,
      action: 'logout',
      resource: 'authentication',
      details: `User ${user.username} logged out`,
      ipAddress: this.getClientIpAddress(),
      userAgent: navigator.userAgent,
      status: 'success'
    };

    this.sendAuditLog(auditLog);
  }

  /**
   * Get audit logs
   */
  getAuditLogs(filter?: AuditLogFilter): Observable<AuditLog[]> {
    return this.http.post<AuditLog[]>(`${this.API_URL}/logs`, filter || {});
  }

  /**
   * Get audit logs for specific user
   */
  getUserAuditLogs(userId: string): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.API_URL}/logs/user/${userId}`);
  }

  /**
   * Get audit logs for specific resource
   */
  getResourceAuditLogs(resource: string, resourceId?: string): Observable<AuditLog[]> {
    const url = resourceId 
      ? `${this.API_URL}/logs/resource/${resource}/${resourceId}`
      : `${this.API_URL}/logs/resource/${resource}`;
    return this.http.get<AuditLog[]>(url);
  }

  /**
   * Export audit logs
   */
  exportAuditLogs(filter?: AuditLogFilter, format: 'csv' | 'json' = 'csv'): Observable<Blob> {
    return this.http.post(`${this.API_URL}/export`, { filter, format }, {
      responseType: 'blob'
    });
  }

  /**
   * Private helper methods
   */

  private sendAuditLog(auditLog: AuditLog): void {
    this.http.post(`${this.API_URL}/log`, auditLog).subscribe({
      next: () => {
        // Log sent successfully
        this.removeFromQueue(auditLog);
      },
      error: (error) => {
        console.error('Failed to send audit log:', error);
        // Queue for retry
        this.addToQueue(auditLog);
      }
    });
  }

  private addToQueue(auditLog: AuditLog): void {
    this.auditQueue.push(auditLog);
    this.saveQueueToStorage();
  }

  private removeFromQueue(auditLog: AuditLog): void {
    this.auditQueue = this.auditQueue.filter(log => 
      log.timestamp !== auditLog.timestamp || log.userId !== auditLog.userId
    );
    this.saveQueueToStorage();
  }

  private saveQueueToStorage(): void {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this.auditQueue));
    } catch (error) {
      console.error('Failed to save audit queue to storage:', error);
    }
  }

  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      if (stored) {
        this.auditQueue = JSON.parse(stored);
        // Retry sending queued logs
        this.auditQueue.forEach(log => this.sendAuditLog(log));
      }
    } catch (error) {
      console.error('Failed to load audit queue from storage:', error);
    }
  }

  private getClientIpAddress(): string {
    // In a real application, this would be obtained from the server
    // For now, return a placeholder
    return 'client-ip';
  }
}
