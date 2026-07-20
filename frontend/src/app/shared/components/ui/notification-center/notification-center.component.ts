import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';

/**
 * Notification Center Component
 *
 * Notification management with:
 * - Notification list UI
 * - Notification preferences/settings
 * - Toast notifications for alerts
 * - Notification history persistence
 *
 * Requirements: 1.3, 5.3
 */

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  notifyOnDataUpdates: boolean;
  notifyOnErrors: boolean;
  notifyOnReports: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification-center.component.html',
})
export class NotificationCenterComponent implements OnInit, OnDestroy {
  @Input() notifications = signal<Notification[]>([]);
  @Output() notificationDismissed = new EventEmitter<string>();
  @Output() notificationRead = new EventEmitter<string>();
  @Output() preferencesChanged = new EventEmitter<NotificationPreferences>();

  showSettings = signal(false);
  preferences: NotificationPreferences = {
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    notifyOnDataUpdates: true,
    notifyOnErrors: true,
    notifyOnReports: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  };

  unreadCount = computed(() => {
    return this.notifications().filter((n) => !n.read).length;
  });

  ngOnInit(): void {
    this.loadPreferencesFromStorage();
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  toggleSettings(): void {
    this.showSettings.update((v) => !v);
  }

  markAsRead(id: string): void {
    const notifs = this.notifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.notifications.set(updated);
    this.notificationRead.emit(id);
  }

  markAllAsRead(): void {
    const notifs = this.notifications();
    const updated = notifs.map((n) => ({ ...n, read: true }));
    this.notifications.set(updated);
  }

  dismissNotification(id: string): void {
    const notifs = this.notifications();
    this.notifications.set(notifs.filter((n) => n.id !== id));
    this.notificationDismissed.emit(id);
  }

  clearAll(): void {
    this.notifications.set([]);
  }

  handleAction(notification: Notification): void {
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  }

  savePreferences(): void {
    localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
    this.preferencesChanged.emit(this.preferences);
  }

  private loadPreferencesFromStorage(): void {
    const stored = localStorage.getItem('notificationPreferences');
    if (stored) {
      try {
        this.preferences = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load preferences from storage', e);
      }
    }
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}
