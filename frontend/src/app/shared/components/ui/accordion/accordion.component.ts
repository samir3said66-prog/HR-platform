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
  templateUrl: './accordion.component.html',
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
