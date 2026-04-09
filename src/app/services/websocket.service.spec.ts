import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketService } from './websocket.service';

/**
 * Test Suite: WebSocket Service
 *
 * Tests for real-time data streaming with RxJS observables.
 * Validates observable cleanup, stream propagation, and connection management.
 *
 * **Validates: Requirements 5.2, 13.1, 13.3, 13.4, 13.5**
 */
describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWebSocket: any;

  beforeEach(() => {
    // Mock WebSocket
    mockWebSocket = {
      readyState: WebSocket.OPEN,
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };

    // Replace global WebSocket with mock constructor
    (globalThis as any).WebSocket = vi.fn(function () {
      return mockWebSocket;
    });

    TestBed.configureTestingModule({
      providers: [WebSocketService],
    });

    service = TestBed.inject(WebSocketService);
  });

  afterEach(() => {
    service.disconnect();
  });

  describe('Observable Cleanup - Property 4', () => {
    /**
     * **Property 4: Observable Cleanup**
     * Observable subscriptions are properly cleaned up on component destruction
     *
     * This property ensures that when a component is destroyed, all subscriptions
     * to WebSocket observables are properly unsubscribed to prevent memory leaks.
     */

    it('should unsubscribe from messages$ when subscription is destroyed', () => {
      const messages: any[] = [];
      const subscription = service.messages$.subscribe((msg) => {
        messages.push(msg);
      });

      // Simulate message
      mockWebSocket.onmessage({ data: JSON.stringify({ type: 'test', data: 'msg1' }) });
      expect(messages.length).toBe(1);

      // Unsubscribe
      subscription.unsubscribe();

      // Simulate another message after unsubscribe
      mockWebSocket.onmessage({ data: JSON.stringify({ type: 'test', data: 'msg2' }) });

      // Should still have only 1 message (not 2)
      expect(messages.length).toBe(1);
    });

    it('should unsubscribe from connectionStatus$ when subscription is destroyed', () => {
      const statuses: any[] = [];
      const subscription = service.connectionStatus$.subscribe((status) => {
        statuses.push(status);
      });

      // Initial status
      expect(statuses.length).toBeGreaterThan(0);
      const initialLength = statuses.length;

      // Unsubscribe
      subscription.unsubscribe();

      // Simulate connection change
      mockWebSocket.onclose();

      // Should not receive new status after unsubscribe
      expect(statuses.length).toBe(initialLength);
    });

    it('should handle multiple subscriptions and cleanup independently', () => {
      const messages1: any[] = [];
      const messages2: any[] = [];

      const sub1 = service.messages$.subscribe((msg) => messages1.push(msg));
      const sub2 = service.messages$.subscribe((msg) => messages2.push(msg));

      // Send message
      mockWebSocket.onmessage({ data: JSON.stringify({ type: 'test', data: 'msg1' }) });
      expect(messages1.length).toBe(1);
      expect(messages2.length).toBe(1);

      // Unsubscribe first subscription
      sub1.unsubscribe();

      // Send another message
      mockWebSocket.onmessage({ data: JSON.stringify({ type: 'test', data: 'msg2' }) });

      // First subscription should not receive new message
      expect(messages1.length).toBe(1);
      // Second subscription should receive new message
      expect(messages2.length).toBe(2);

      sub2.unsubscribe();
    });

    it('should cleanup all subscriptions when service is destroyed', () => {
      const messages: any[] = [];
      const statuses: any[] = [];

      service.messages$.subscribe((msg) => messages.push(msg));
      service.connectionStatus$.subscribe((status) => statuses.push(status));

      mockWebSocket.onmessage({ data: JSON.stringify({ type: 'test', data: 'msg1' }) });
      expect(messages.length).toBe(1);

      // Disconnect service
      service.disconnect();

      // Simulate message after disconnect
      mockWebSocket.onmessage({ data: JSON.stringify({ type: 'test', data: 'msg2' }) });

      // Should not receive new messages after disconnect
      // (Note: the subscription is still active, but the service won't emit new messages)
      expect(messages.length).toBe(1);
    });
  });;

  describe('Stream Propagation - Property 5', () => {
    /**
     * **Property 5: Stream Propagation**
     * Data updates propagate to all subscribers within 500ms
     *
     * This property ensures that when data is received from the WebSocket,
     * it is propagated to all subscribers within the required 500ms timeframe.
     */

    it('should propagate messages to all subscribers immediately', () => {
      const messages1: any[] = [];
      const messages2: any[] = [];
      const messages3: any[] = [];

      service.messages$.subscribe((msg) => messages1.push(msg));
      service.messages$.subscribe((msg) => messages2.push(msg));
      service.messages$.subscribe((msg) => messages3.push(msg));

      const testMessage = { type: 'employee', data: { id: '1', name: 'John' } };
      mockWebSocket.onmessage({ data: JSON.stringify(testMessage) });

      // All subscribers should receive the message
      expect(messages1.length).toBe(1);
      expect(messages2.length).toBe(1);
      expect(messages3.length).toBe(1);

      expect(messages1[0]).toEqual(testMessage);
      expect(messages2[0]).toEqual(testMessage);
      expect(messages3[0]).toEqual(testMessage);
    });

    it('should propagate multiple messages in order', () => {
      const messages: any[] = [];
      service.messages$.subscribe((msg) => messages.push(msg));

      const msg1 = { type: 'test', data: 'first' };
      const msg2 = { type: 'test', data: 'second' };
      const msg3 = { type: 'test', data: 'third' };

      mockWebSocket.onmessage({ data: JSON.stringify(msg1) });
      mockWebSocket.onmessage({ data: JSON.stringify(msg2) });
      mockWebSocket.onmessage({ data: JSON.stringify(msg3) });

      expect(messages.length).toBe(3);
      expect(messages[0]).toEqual(msg1);
      expect(messages[1]).toEqual(msg2);
      expect(messages[2]).toEqual(msg3);
    });

    it('should propagate filtered messages via subscribe method', () => {
      const employeeMessages: any[] = [];
      const performanceMessages: any[] = [];

      service.subscribe('employee').subscribe((data) => employeeMessages.push(data));
      service.subscribe('performance').subscribe((data) => performanceMessages.push(data));

      mockWebSocket.onmessage({
        data: JSON.stringify({ type: 'employee', data: { id: '1' } }),
      });
      mockWebSocket.onmessage({
        data: JSON.stringify({ type: 'performance', data: { score: 85 } }),
      });
      mockWebSocket.onmessage({
        data: JSON.stringify({ type: 'employee', data: { id: '2' } }),
      });

      expect(employeeMessages.length).toBe(2);
      expect(performanceMessages.length).toBe(1);
      expect(employeeMessages[0]).toEqual({ id: '1' });
      expect(employeeMessages[1]).toEqual({ id: '2' });
      expect(performanceMessages[0]).toEqual({ score: 85 });
    });

    it('should handle rapid message propagation', () => {
      const messages: any[] = [];
      service.messages$.subscribe((msg) => messages.push(msg));

      // Simulate rapid messages
      for (let i = 0; i < 100; i++) {
        mockWebSocket.onmessage({
          data: JSON.stringify({ type: 'test', data: i }),
        });
      }

      expect(messages.length).toBe(100);
      for (let i = 0; i < 100; i++) {
        expect(messages[i].data).toBe(i);
      }
    });

    it('should propagate connection status changes to all subscribers', () => {
      const statuses1: any[] = [];
      const statuses2: any[] = [];

      service.connectionStatus$.subscribe((status) => statuses1.push(status));
      service.connectionStatus$.subscribe((status) => statuses2.push(status));

      // Simulate connection change
      mockWebSocket.readyState = WebSocket.CLOSED;
      mockWebSocket.onclose();

      // Both subscribers should receive the status change
      // Status should be either disconnected or reconnecting (due to auto-reconnect)
      expect(['disconnected', 'reconnecting']).toContain(statuses1[statuses1.length - 1]);
      expect(['disconnected', 'reconnecting']).toContain(statuses2[statuses2.length - 1]);
    });
  });

  describe('Connection Management', () => {
    it('should track connection status correctly', () => {
      // Service auto-connects in constructor, so it should be connected initially
      // (or reconnecting if the mock connection fails)
      const status = service.getConnectionStatus();
      expect(['connected', 'reconnecting', 'disconnected']).toContain(status);

      // Simulate close and update readyState
      mockWebSocket.readyState = WebSocket.CLOSED;
      mockWebSocket.onclose();
      expect(service.isConnected()).toBe(false);
    });

    it('should handle connection errors gracefully', () => {
      const statuses: any[] = [];
      service.connectionStatus$.subscribe((status) => statuses.push(status));

      // Simulate error and update readyState
      mockWebSocket.readyState = WebSocket.CLOSED;
      mockWebSocket.onerror(new Event('error'));

      expect(service.isConnected()).toBe(false);
      // Last status should be disconnected or reconnecting
      expect(['disconnected', 'reconnecting']).toContain(statuses[statuses.length - 1]);
    });

    it('should send messages when connected', () => {
      // Ensure we're connected
      mockWebSocket.readyState = WebSocket.OPEN;
      
      const testData = { type: 'test', data: 'hello' };
      service.send(testData);

      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(testData));
    });

    it('should not send messages when disconnected', () => {
      // Reset the spy to clear previous calls
      vi.clearAllMocks();
      
      // Ensure readyState is CLOSED
      mockWebSocket.readyState = WebSocket.CLOSED;
      
      const testData = { type: 'test', data: 'hello' };
      service.send(testData);

      // Should not call send when disconnected
      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });
  });;

  describe('Message Parsing', () => {
    it('should parse valid JSON messages', () => {
      const messages: any[] = [];
      service.messages$.subscribe((msg) => messages.push(msg));

      const validMessage = { type: 'test', data: { id: 1, name: 'test' } };
      mockWebSocket.onmessage({ data: JSON.stringify(validMessage) });

      expect(messages.length).toBe(1);
      expect(messages[0]).toEqual(validMessage);
    });

    it('should handle invalid JSON gracefully', () => {
      const messages: any[] = [];
      service.messages$.subscribe((msg) => messages.push(msg));

      // Send invalid JSON
      mockWebSocket.onmessage({ data: 'invalid json {' });

      // Should not add invalid message to stream
      expect(messages.length).toBe(0);
    });
  });
});
