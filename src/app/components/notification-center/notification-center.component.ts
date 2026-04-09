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
  imports: [CommonModule, FormsModule, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-lg overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-3">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h3>
          <span
            *ngIf="unreadCount() > 0"
            class="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-600 rounded-full"
            [attr.aria-label]="unreadCount() + ' unread notifications'"
          >
            {{ unreadCount() }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="toggleSettings()"
            class="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            [attr.aria-label]="showSettings() ? 'Hide settings' : 'Show settings'"
          >
            ⚙️
          </button>
          <button
            (click)="markAllAsRead()"
            class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            aria-label="Mark all as read"
          >
            Mark all read
          </button>
        </div>
      </div>

      <!-- Settings Panel -->
      <div *ngIf="showSettings()" class="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
        <h4 class="text-sm font-semibold text-slate-900 dark:text-white mb-4">Notification Preferences</h4>

        <div class="space-y-3">
          <!-- Email Notifications -->
          <div class="flex items-center">
            <input
              type="checkbox"
              id="emailNotif"
              [(ngModel)]="preferences.emailNotifications"
              (change)="savePreferences()"
              class="w-4 h-4 rounded"
              aria-label="Enable email notifications"
            />
            <label for="emailNotif" class="ml-3 text-sm text-slate-700 dark:text-slate-300">
              Email Notifications
            </label>
          </div>

          <!-- Push Notifications -->
          <div class="flex items-center">
            <input
              type="checkbox"
              id="pushNotif"
              [(ngModel)]="preferences.pushNotifications"
              (change)="savePreferences()"
              class="w-4 h-4 rounded"
              aria-label="Enable push notifications"
            />
            <label for="pushNotif" class="ml-3 text-sm text-slate-700 dark:text-slate-300">
              Push Notifications
            </label>
          </div>

          <!-- In-App Notifications -->
          <div class="flex items-center">
            <input
              type="checkbox"
              id="inAppNotif"
              [(ngModel)]="preferences.inAppNotifications"
              (change)="savePreferences()"
              class="w-4 h-4 rounded"
              aria-label="Enable in-app notifications"
            />
            <label for="inAppNotif" class="ml-3 text-sm text-slate-700 dark:text-slate-300">
              In-App Notifications
            </label>
          </div>

          <!-- Notification Types -->
          <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">Notify me about:</p>

            <div class="flex items-center">
              <input
                type="checkbox"
                id="dataUpdates"
                [(ngModel)]="preferences.notifyOnDataUpdates"
                (change)="savePreferences()"
                class="w-4 h-4 rounded"
                aria-label="Notify on data updates"
              />
              <label for="dataUpdates" class="ml-3 text-sm text-slate-700 dark:text-slate-300">
                Data Updates
              </label>
            </div>

            <div class="flex items-center mt-2">
              <input
                type="checkbox"
                id="errors"
                [(ngModel)]="preferences.notifyOnErrors"
                (change)="savePreferences()"
                class="w-4 h-4 rounded"
                aria-label="Notify on errors"
              />
              <label for="errors" class="ml-3 text-sm text-slate-700 dark:text-slate-300">
                Errors & Alerts
              </label>
            </div>

            <div class="flex items-center mt-2">
              <input
                type="checkbox"
                id="reports"
                [(ngModel)]="preferences.notifyOnReports"
                (change)="savePreferences()"
                class="w-4 h-4 rounded"
                aria-label="Notify on reports"
              />
              <label for="reports" class="ml-3 text-sm text-slate-700 dark:text-slate-300">
                Report Generation
              </label>
            </div>
          </div>

          <!-- Quiet Hours -->
          <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div class="flex items-center">
              <input
                type="checkbox"
                id="quietHours"
                [(ngModel)]="preferences.quietHours.enabled"
                (change)="savePreferences()"
                class="w-4 h-4 rounded"
                aria-label="Enable quiet hours"
              />
              <label for="quietHours" class="ml-3 text-sm text-slate-700 dark:text-slate-300">
                Quiet Hours
              </label>
            </div>

            <div *ngIf="preferences.quietHours.enabled" class="mt-3 ml-7 space-y-2">
              <div>
                <label class="text-xs text-slate-600 dark:text-slate-400">From</label>
                <input
                  type="time"
                  [(ngModel)]="preferences.quietHours.start"
                  (change)="savePreferences()"
                  class="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  aria-label="Quiet hours start time"
                />
              </div>
              <div>
                <label class="text-xs text-slate-600 dark:text-slate-400">To</label>
                <input
                  type="time"
                  [(ngModel)]="preferences.quietHours.end"
                  (change)="savePreferences()"
                  class="w-full px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  aria-label="Quiet hours end time"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="max-h-96 overflow-y-auto">
        <div *ngIf="notifications().length === 0" class="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
          <p class="text-sm">No notifications yet</p>
        </div>

        <div *ngFor="let notification of notifications()" class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" [class.bg-blue-50]="!notification.read" [class.dark:bg-blue-900/20]="!notification.read">
          <div class="flex items-start gap-3">
            <!-- Type Icon -->
            <div
              class="flex-shrink-0 w-2 h-2 mt-2 rounded-full"
              [class.bg-blue-500]="notification.type === 'info'"
              [class.bg-green-500]="notification.type === 'success'"
              [class.bg-yellow-500]="notification.type === 'warning'"
              [class.bg-red-500]="notification.type === 'error'"
              [attr.aria-label]="notification.type + ' notification'"
            ></div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <h4 class="text-sm font-semibold text-slate-900 dark:text-white">
                  {{ notification.title }}
                </h4>
                <button
                  (click)="dismissNotification(notification.id)"
                  class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0"
                  [attr.aria-label]="'Dismiss ' + notification.title"
                >
                  ×
                </button>
              </div>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {{ notification.message }}
              </p>
              <div class="flex items-center justify-between mt-2">
                <span class="text-xs text-slate-500 dark:text-slate-500">
                  {{ formatTime(notification.timestamp) }}
                </span>
                <div class="flex items-center gap-2">
                  <button
                    *ngIf="notification.actionUrl"
                    (click)="handleAction(notification)"
                    class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                    [attr.aria-label]="notification.actionLabel || 'View'"
                  >
                    {{ notification.actionLabel || 'View' }}
                  </button>
                  <button
                    *ngIf="!notification.read"
                    (click)="markAsRead(notification.id)"
                    class="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    aria-label="Mark as read"
                  >
                    Mark read
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
        <button
          (click)="clearAll()"
          class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          aria-label="Clear all notifications"
        >
          Clear all
        </button>
        <a href="#" class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
          View all notifications
        </a>
      </div>
    </div>
  `,
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
