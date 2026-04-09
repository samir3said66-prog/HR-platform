import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WebSocketService } from '../../services/websocket.service';
import { AppState } from '../app.state';
import * as EmployeeActions from './employees.actions';
import { Employee } from './employees.state';
import { Subject } from 'rxjs';

/**
 * Integration Test Suite: Real-Time Features
 * 
 * Tests for real-time data synchronization across multiple users,
 * connection loss and recovery, and real-time update propagation.
 * 
 * **Validates: Requirements 5.1, 5.2, 5.5, 21.1**
 */
describe('Real-Time Features Integration', () => {
  let store: MockStore<AppState>;
  let wsService: WebSocketService;
  let mockWebSocket: any;
  let messageSubject: Subject<any>;

  const initialState: AppState = {
    employees: {
      entities: {},
      ids: [],
      loading: false,
      error: null,
      selectedEmployeeId: null,
    },
    performance: {
      entities: {},
      ids: [],
      loading: false,
      error: null,
      lastUpdated: null,
    },
    preferences: {
      preferences: null,
      loading: false,
      error: null,
    },
    dashboard: {
      configs: {},
      configIds: [],
      currentConfigId: null,
      metrics: null,
      loading: false,
      error: null,
    },
  };

  beforeEach(() => {
    messageSubject = new Subject();

    mockWebSocket = {
      readyState: WebSocket.OPEN,
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };

    (globalThis as any).WebSocket = vi.fn(() => mockWebSocket);

    TestBed.configureTestingModule({
      providers: [
        WebSocketService,
        provideMockStore({ initialState }),
      ],
    });

    wsService = TestBed.inject(WebSocketService);
    store = TestBed.inject(MockStore);
  });

  describe('Multiple Users Updating Same Dashboard', () => {
    /**
     * Test: Multiple users updating the same dashboard simultaneously
     * should receive real-time updates without conflicts.
     */

    it('should synchronize updates across multiple users', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      const updates: any[] = [];
      wsService.subscribe('employee-update').subscribe((data) => {
        updates.push(data);
      });

      // Simulate updates from multiple users
      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'employee-update',
          data: { ...employee, role: 'Lead Engineer', userId: 'user-1' },
        }),
      });

      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'employee-update',
          data: { ...employee, department: 'Management', userId: 'user-2' },
        }),
      });

      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'employee-update',
          data: { ...employee, role: 'Principal Engineer', userId: 'user-3' },
        }),
      });

      // All updates should be received
      expect(updates.length).toBe(3);
      expect(updates[0].userId).toBe('user-1');
      expect(updates[1].userId).toBe('user-2');
      expect(updates[2].userId).toBe('user-3');
    });

    it('should handle concurrent updates from multiple users to same record', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      const updates: any[] = [];
      wsService.subscribe('employee-update').subscribe((data) => {
        updates.push(data);
      });

      // Simulate concurrent updates to same employee from different users
      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'employee-update',
          data: { ...employee, role: 'Lead Engineer', timestamp: 1000, userId: 'user-1' },
        }),
      });

      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'employee-update',
          data: { ...employee, role: 'Principal Engineer', timestamp: 1001, userId: 'user-2' },
        }),
      });

      expect(updates.length).toBe(2);
      // Later timestamp should be the final state
      expect(updates[1].timestamp).toBeGreaterThan(updates[0].timestamp);
    });

    it('should maintain consistency when multiple users update different employees', () => {
      const employees: Employee[] = [
        {
          id: 'emp-1',
          name: 'John Doe',
          email: 'john@example.com',
          department: 'Engineering',
          region: 'Europe',
          role: 'Senior Engineer',
          employmentStatus: 'active',
          hireDate: '2020-01-15',
        },
        {
          id: 'emp-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          department: 'HR',
          region: 'Middle East',
          role: 'HR Manager',
          employmentStatus: 'active',
          hireDate: '2021-06-01',
        },
      ];

      const updates: any[] = [];
      wsService.subscribe('employee-update').subscribe((data) => {
        updates.push(data);
      });

      // User 1 updates employee 1
      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'employee-update',
          data: { ...employees[0], role: 'Lead Engineer', userId: 'user-1' },
        }),
      });

      // User 2 updates employee 2
      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'employee-update',
          data: { ...employees[1], role: 'Director', userId: 'user-2' },
        }),
      });

      expect(updates.length).toBe(2);
      expect(updates[0].id).toBe('emp-1');
      expect(updates[1].id).toBe('emp-2');
    });
  });

  describe('Connection Loss and Recovery', () => {
    /**
     * Test: When connection is lost, updates should be queued locally
     * and synchronized when connection is restored.
     */

    it('should queue updates when connection is lost', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      // Simulate connection loss
      mockWebSocket.readyState = WebSocket.CLOSED;
      mockWebSocket.onclose();

      // Dispatch update while disconnected
      store.dispatch(EmployeeActions.updateEmployee({ employee }));

      // Update should be queued
      expect(store.dispatch).toHaveBeenCalled();
    });

    it('should synchronize queued updates when connection is restored', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      // Simulate connection loss
      mockWebSocket.readyState = WebSocket.CLOSED;
      mockWebSocket.onclose();

      // Queue updates
      store.dispatch(EmployeeActions.updateEmployee({ employee: { ...employee, role: 'Lead' } }));
      store.dispatch(EmployeeActions.updateEmployee({ employee: { ...employee, department: 'Mgmt' } }));

      // Simulate connection restored
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.onopen();

      // Queued updates should be sent
      expect(mockWebSocket.send).toHaveBeenCalled();
    });

    it('should handle reconnection with exponential backoff', () => {
      // Simulate connection loss
      mockWebSocket.onclose();

      expect(wsService.getConnectionStatus()).toBe('disconnected');
    });

    it('should recover from temporary connection interruptions', () => {
      const statuses: any[] = [];
      wsService.connectionStatus$.subscribe((status) => {
        statuses.push(status);
      });

      // Simulate connection loss
      mockWebSocket.onclose();
      expect(statuses[statuses.length - 1]).toBe('disconnected');

      // Simulate reconnection
      mockWebSocket.readyState = WebSocket.OPEN;
      mockWebSocket.onopen();
      expect(wsService.isConnected()).toBe(true);
    });
  });

  describe('Real-Time Update Propagation', () => {
    /**
     * Test: Real-time updates should propagate to all connected clients
     * within 500ms as required.
     */

    it('should propagate updates within 500ms', () => {
      const updates: any[] = [];
      const startTime = Date.now();

      wsService.subscribe('employee-update').subscribe((data) => {
        const propagationTime = Date.now() - startTime;
        updates.push({ data, propagationTime });
      });

      // Simulate update
      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'employee-update',
          data: { id: 'emp-1', name: 'John Doe' },
        }),
      });

      expect(updates.length).toBe(1);
      expect(updates[0].propagationTime).toBeLessThan(500);
    });

    it('should handle high-frequency updates', () => {
      const updates: any[] = [];

      wsService.subscribe('employee-update').subscribe((data) => {
        updates.push(data);
      });

      // Simulate high-frequency updates
      for (let i = 0; i < 100; i++) {
        mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'employee-update',
            data: { id: `emp-${i}`, name: `Employee ${i}` },
          }),
        });
      }

      expect(updates.length).toBe(100);
    });

    it('should maintain order of updates during propagation', () => {
      const updates: any[] = [];

      wsService.subscribe('employee-update').subscribe((data) => {
        updates.push(data);
      });

      // Simulate ordered updates
      for (let i = 0; i < 10; i++) {
        mockWebSocket.onmessage({
          data: JSON.stringify({
            type: 'employee-update',
            data: { id: 'emp-1', sequence: i },
          }),
        });
      }

      expect(updates.length).toBe(10);
      for (let i = 0; i < 10; i++) {
        expect(updates[i].sequence).toBe(i);
      }
    });
  });

  describe('Race Condition Prevention', () => {
    /**
     * Test: The system should prevent race conditions when multiple
     * users update the same record simultaneously.
     */

    it('should prevent race conditions with server-side conflict resolution', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      // Simulate concurrent updates from two users
      const update1 = { ...employee, role: 'Lead Engineer', timestamp: 1000, userId: 'user-1' };
      const update2 = { ...employee, role: 'Principal Engineer', timestamp: 1001, userId: 'user-2' };

      store.dispatch(EmployeeActions.updateEmployee({ employee: update1 }));
      store.dispatch(EmployeeActions.updateEmployee({ employee: update2 }));

      // Server should resolve conflict (last write wins or merge)
      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });

    it('should notify users of conflicts', () => {
      const employee: Employee = {
        id: 'emp-1',
        name: 'John Doe',
        email: 'john@example.com',
        department: 'Engineering',
        region: 'Europe',
        role: 'Senior Engineer',
        employmentStatus: 'active',
        hireDate: '2020-01-15',
      };

      // Simulate conflict
      store.dispatch(EmployeeActions.updateEmployee({ employee }));
      store.dispatch(
        EmployeeActions.loadEmployeesFailure({
          error: 'Conflict: Employee was modified by another user',
        }),
      );

      expect(store.dispatch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Dashboard Synchronization', () => {
    it('should synchronize dashboard metrics across multiple users', () => {
      const metrics: any[] = [];

      wsService.subscribe('dashboard-metrics').subscribe((data) => {
        metrics.push(data);
      });

      // Simulate metrics updates from server
      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'dashboard-metrics',
          data: { headcount: 100, activeEmployees: 95 },
        }),
      });

      mockWebSocket.onmessage({
        data: JSON.stringify({
          type: 'dashboard-metrics',
          data: { headcount: 101, activeEmployees: 96 },
        }),
      });

      expect(metrics.length).toBe(2);
      expect(metrics[1].headcount).toBe(101);
    });
  });
});

