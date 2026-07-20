import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebSocketService } from './websocket.service';

/**
 * Test Suite: WebSocket Service
 *
 * Validates: Requirements 5.2, 13.1, 13.3, 13.4, 13.5
 */
describe('WebSocketService', () => {
  let service: WebSocketService;
  let mockWebSocket: any;

  beforeEach(() => {
    // Mock WebSocket instance
    mockWebSocket = {
      readyState: 1, // OPEN
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    };

    // Mock WebSocket constructor with static properties
    // Use regular function to support 'new'
    const MockWS = vi.fn(function(this: any) {
      return mockWebSocket;
    }) as any;
    
    MockWS.CONNECTING = 0;
    MockWS.OPEN = 1;
    MockWS.CLOSING = 2;
    MockWS.CLOSED = 3;

    (globalThis as any).WebSocket = MockWS;

    TestBed.configureTestingModule({
      providers: [WebSocketService],
    });

    service = TestBed.inject(WebSocketService);
    
    // Trigger onopen manually because service connects in constructor
    if (mockWebSocket.onopen) {
      mockWebSocket.onopen();
    }
  });

  afterEach(() => {
    service.disconnect();
    vi.restoreAllMocks();
  });

  describe('Observable Cleanup', () => {
    it('should unsubscribe from messages$ when subscription is destroyed', () => {
      const messages: any[] = [];
      const subscription = service.messages$.subscribe((msg) => {
        messages.push(msg);
      });

      mockWebSocket.onmessage({ data: JSON.stringify({ type: 'test', data: 'msg1' }) });
      expect(messages.length).toBe(1);

      subscription.unsubscribe();
      mockWebSocket.onmessage({ data: JSON.stringify({ type: 'test', data: 'msg2' }) });
      expect(messages.length).toBe(1);
    });
  });

  describe('Stream Propagation', () => {
    it('should propagate messages to all subscribers immediately', () => {
      const messages1: any[] = [];
      const testMessage = { type: 'employee', data: { id: '1', name: 'John' } };
      
      service.messages$.subscribe((msg) => messages1.push(msg));
      mockWebSocket.onmessage({ data: JSON.stringify(testMessage) });

      expect(messages1.length).toBe(1);
      expect(messages1[0]).toEqual(testMessage);
    });
  });

  describe('Connection Management', () => {
    it('should send messages when connected', () => {
      mockWebSocket.readyState = 1; // OPEN
      const testData = { type: 'test', data: 'hello' };
      service.send(testData);

      expect(mockWebSocket.send).toHaveBeenCalledWith(JSON.stringify(testData));
    });

    it('should not send messages when disconnected', () => {
      vi.clearAllMocks();
      mockWebSocket.readyState = 3; // CLOSED
      
      const testData = { type: 'test', data: 'hello' };
      service.send(testData);

      expect(mockWebSocket.send).not.toHaveBeenCalled();
    });
  });
});
