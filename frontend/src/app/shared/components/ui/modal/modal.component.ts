import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  HostListener,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Modal Component
 *
 * A reusable modal dialog component with accessibility features.
 * Supports header, body, and footer slots with focus trap and keyboard support.
 *
 * Requirements: 8.2, 8.3, 8.4
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styles: [
    `
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideIn {
        from {
          transform: scale(0.95);
          opacity: 0;
        }
        to {
          transform: scale(1);
          opacity: 1;
        }
      }

      :host ::ng-deep .animate-in {
        animation: slideIn 0.3s ease-out;
      }
    `,
  ],
})
export class ModalComponent implements AfterViewInit, OnDestroy {
  @Input() title: string | null = null;
  @Input() showCloseButton = true;
  @Input() closeOnBackdropClick = true;
  @Input() actions: ModalAction[] = [];
  @Output() onClose = new EventEmitter<void>();
  @Output() onAction = new EventEmitter<ModalAction>();

  @ViewChild('modalDialog') modalDialog: ElementRef | null = null;

  isOpen = signal(false);
  titleId = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  descriptionId = `modal-description-${Math.random().toString(36).substr(2, 9)}`;
  hasHeader = false;
  hasFooter = false;

  private focusableElements: HTMLElement[] = [];
  private previousActiveElement: HTMLElement | null = null;

  constructor(private elementRef: ElementRef) {
    effect(() => {
      if (this.isOpen()) {
        this.setupFocusTrap();
        this.previousActiveElement = document.activeElement as HTMLElement;
      } else {
        this.removeFocusTrap();
        if (this.previousActiveElement) {
          this.previousActiveElement.focus();
        }
      }
    });
  }

  ngAfterViewInit(): void {
    // Check for header/footer content
    setTimeout(() => {
      const header = this.elementRef.nativeElement.querySelector('[appModalHeader]');
      const footer = this.elementRef.nativeElement.querySelector('[appModalFooter]');
      this.hasHeader = !!header;
      this.hasFooter = !!footer;
    });
  }

  ngOnDestroy(): void {
    this.removeFocusTrap();
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.onClose.emit();
  }

  onBackdropClick(): void {
    if (this.closeOnBackdropClick) {
      this.close();
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.close();
      return;
    }

    if (event.key === 'Tab') {
      this.handleTabKey(event);
    }
  }

  onActionClick(action: ModalAction): void {
    this.onAction.emit(action);
    if (action.closeOnClick !== false) {
      this.close();
    }
  }

  private setupFocusTrap(): void {
    if (!this.modalDialog) return;

    const focusableSelectors = [
      'button',
      '[href]',
      'input',
      'select',
      'textarea',
      '[tabindex]:not([tabindex="-1"])',
    ];

    this.focusableElements = Array.from(
      this.modalDialog.nativeElement.querySelectorAll(focusableSelectors.join(',')),
    ).filter((el: any) => {
      return !el.hasAttribute('disabled') && el.offsetParent !== null;
    }) as HTMLElement[];

    if (this.focusableElements.length > 0) {
      setTimeout(() => {
        this.focusableElements[0].focus();
      });
    }
  }

  private removeFocusTrap(): void {
    this.focusableElements = [];
  }

  private handleTabKey(event: KeyboardEvent): void {
    if (this.focusableElements.length === 0) return;

    const activeElement = document.activeElement as HTMLElement;
    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (event.shiftKey) {
      if (activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  getActionButtonClasses(variant?: string): string {
    const baseClasses =
      'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-base';
    const variantClasses = {
      primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
      secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 focus:ring-slate-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    };
    const selectedVariant = (variant || 'secondary') as keyof typeof variantClasses;
    return `${baseClasses} ${variantClasses[selectedVariant]}`;
  }
}

export interface ModalAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  closeOnClick?: boolean;
}
