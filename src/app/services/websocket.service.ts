import { Injectable } from '@angular/core';
import { Subject, Observable, BehaviorSubject, interval } from 'rxjs';
import { filter, map, retryWhen, delay, take } from 'rxjs/operators';

/**
 * WebSocket Service
 * 
 * Manages WebSocket connections for real-time data updates.
 * Implements automatic reconnection with exponential backoff.
 * Handles connection state management and data streaming.
 * 
 * Requirements: 5.1, 5.2, 13.1, 13.2
 */
@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private ws: WebSocket | null = null;
  private messageSubject = new Subject<any>();
  private connectionStatus = new BehaviorSubject<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  messages$: Observable<any> = this.messageSubject.asObservable();
  connectionStatus$: Observable<'connected' | 'disconnected' | 'reconnecting'> = this.connectionStatus.asObservable();

  constructor() {
    // Auto-connect on service initialization
    this.connect();
  }

  connect(url: string = 'ws://localhost:8080'): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        console.log('[WebSocketService] Connected to WebSocket server');
        this.connectionStatus.next('connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
      };

      this.ws.onmessage = (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          this.messageSubject.next(data);
        } catch (error) {
          console.error('[WebSocketService] Failed to parse message:', error);
        }
      };

      this.ws.onerror = (error: Event) => {
        console.error('[WebSocketService] WebSocket error:', error);
        this.connectionStatus.next('disconnected');
      };

      this.ws.onclose = () => {
        console.log('[WebSocketService] Disconnected from WebSocket server');
        this.connectionStatus.next('disconnected');
        this.attemptReconnect(url);
      };
    } catch (error) {
      console.error('[WebSocketService] Failed to create WebSocket:', error);
      this.connectionStatus.next('disconnected');
      this.attemptReconnect(url);
    }
  }

  private attemptReconnect(url: string): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocketService] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.connectionStatus.next('reconnecting');

    const delay = Math.pow(2, this.reconnectAttempts - 1) * this.reconnectDelay;
    console.log(`[WebSocketService] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    setTimeout(() => {
      this.connect(url);
    }, delay);
  }

  send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      console.warn('[WebSocketService] WebSocket is not connected');
    }
  }

  subscribe<T>(messageType: string): Observable<T> {
    return this.messages$.pipe(
      filter((msg) => msg.type === messageType),
      map((msg) => msg.data as T),
    );
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connectionStatus.next('disconnected');
  }

  isConnected(): boolean {
    return this.connectionStatus.value === 'connected';
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'reconnecting' {
    return this.connectionStatus.value;
  }
}
