/**
 * UI Models
 * Generic UI state and component models
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface Modal {
  id: string;
  title: string;
  content: string;
  buttons?: ModalButton[];
  size?: 'small' | 'medium' | 'large';
}

export interface ModalButton {
  label: string;
  action: string;
  type?: 'primary' | 'secondary' | 'danger';
}

export interface Breadcrumb {
  label: string;
  url?: string;
  icon?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}
