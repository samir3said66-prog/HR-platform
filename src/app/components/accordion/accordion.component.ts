import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Accordion Component
 *
 * A reusable accordion component with keyboard navigation and accessibility.
 * Supports single or multiple items open at once with smooth animations.
 *
 * Requirements: 8.2, 8.3, 8.4
 */
@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-2">
      <div
        *ngFor="let item of items; let i = index"
        class="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
      >
        <!-- Accordion Header -->
        <button
          (click)="toggleItem(i)"
          [attr.aria-expanded]="isItemOpen(i)"
          [attr.aria-controls]="'accordion-panel-' + i"
          [disabled]="item.disabled"
          class="w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-inset dark:focus:ring-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
          role="button"
          type="button"
          (keydown)="onHeaderKeyDown($event, i)"
        >
          <span class="flex items-center gap-3 text-left">
            <svg
              class="w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform duration-300"
              [class.rotate-180]="isItemOpen(i)"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              ></path>
            </svg>
            <span class="font-medium text-slate-900 dark:text-white">
              {{ item.title }}
            </span>
          </span>
          <span *ngIf="item.badge" class="text-xs bg-indigo-600 text-white px-2 py-1 rounded">
            {{ item.badge }}
          </span>
        </button>

        <!-- Accordion Panel -->
        <div
          *ngIf="isItemOpen(i)"
          [id]="'accordion-panel-' + i"
          role="region"
          [attr.aria-labelledby]="'accordion-header-' + i"
          class="border-t border-slate-200 dark:border-slate-700 px-4 py-3 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <ng-container *ngIf="item.content">
            {{ item.content }}
          </ng-container>
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes slideInFromTop {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      :host ::ng-deep .slide-in-from-top-2 {
        animation: slideInFromTop 0.3s ease-out;
      }
    `,
  ],
})
export class AccordionComponent implements OnInit {
  @Input() items: AccordionItem[] = [];
  @Input() allowMultiple = false;
  @Output() onItemToggle = new EventEmitter<number>();

  openItems = signal<Set<number>>(new Set());

  ngOnInit(): void {
    // Initialize with first item open if not allowing multiple
    if (this.items.length > 0 && !this.allowMultiple) {
      this.openItems.set(new Set([0]));
    }
  }

  toggleItem(index: number): void {
    if (this.items[index].disabled) return;

    const newOpenItems = new Set(this.openItems());

    if (this.allowMultiple) {
      if (newOpenItems.has(index)) {
        newOpenItems.delete(index);
      } else {
        newOpenItems.add(index);
      }
    } else {
      newOpenItems.clear();
      newOpenItems.add(index);
    }

    this.openItems.set(newOpenItems);
    this.onItemToggle.emit(index);
  }

  isItemOpen(index: number): boolean {
    return this.openItems().has(index);
  }

  onHeaderKeyDown(event: KeyboardEvent, index: number): void {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleItem(index);
        break;

      case 'ArrowDown':
        event.preventDefault();
        if (index < this.items.length - 1) {
          const nextButton = document.querySelector(
            `button[aria-controls="accordion-panel-${index + 1}"]`,
          ) as HTMLButtonElement;
          nextButton?.focus();
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (index > 0) {
          const prevButton = document.querySelector(
            `button[aria-controls="accordion-panel-${index - 1}"]`,
          ) as HTMLButtonElement;
          prevButton?.focus();
        }
        break;

      case 'Home':
        event.preventDefault();
        const firstButton = document.querySelector(
          'button[aria-controls="accordion-panel-0"]',
        ) as HTMLButtonElement;
        firstButton?.focus();
        break;

      case 'End':
        event.preventDefault();
        const lastButton = document.querySelector(
          `button[aria-controls="accordion-panel-${this.items.length - 1}"]`,
        ) as HTMLButtonElement;
        lastButton?.focus();
        break;
    }
  }
}

export interface AccordionItem {
  id: string;
  title: string;
  content?: string;
  badge?: string;
  disabled?: boolean;
}
