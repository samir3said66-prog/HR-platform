import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  HostListener,
  signal,
  effect,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Dropdown/Menu Component
 *
 * A reusable dropdown menu component with keyboard navigation and accessibility.
 * Supports menu items with icons, submenus, and position management.
 *
 * Requirements: 8.2, 8.3, 8.4
 */
@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block" (clickOutside)="close()">
      <!-- Trigger Button -->
      <button
        #triggerButton
        (click)="toggle()"
        [attr.aria-haspopup]="true"
        [attr.aria-expanded]="isOpen()"
        [attr.aria-controls]="menuId"
        class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        type="button"
      >
        {{ triggerLabel }}
        <svg
          class="w-4 h-4 transition-transform duration-200"
          [class.rotate-180]="isOpen()"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </button>

      <!-- Dropdown Menu -->
      <div
        *ngIf="isOpen()"
        #menu
        [id]="menuId"
        class="absolute z-50 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200"
        [ngClass]="getMenuPositionClasses()"
        role="menu"
        (keydown)="onMenuKeyDown($event)"
      >
        <div class="py-1">
          <ng-container *ngFor="let item of items; let i = index">
            <!-- Menu Item -->
            <button
              *ngIf="!item.submenu"
              (click)="selectItem(item)"
              (mouseenter)="highlightedIndex.set(i)"
              [class.bg-indigo-50]="highlightedIndex() === i"
              [class.dark:bg-slate-700]="highlightedIndex() === i"
              class="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 focus:outline-none focus:bg-indigo-50 dark:focus:bg-slate-700"
              role="menuitem"
              type="button"
              [attr.aria-label]="item.label"
            >
              <svg *ngIf="item.icon" class="w-4 h-4" [innerHTML]="item.icon"></svg>
              <span>{{ item.label }}</span>
              <span *ngIf="item.badge" class="ml-auto text-xs bg-indigo-600 text-white px-2 py-1 rounded">
                {{ item.badge }}
              </span>
            </button>

            <!-- Submenu Item -->
            <div
              *ngIf="item.submenu"
              class="relative group"
              (mouseenter)="highlightedIndex.set(i)"
              (mouseleave)="highlightedIndex.set(-1)"
            >
              <button
                (click)="toggleSubmenu(i)"
                [class.bg-indigo-50]="highlightedIndex() === i"
                [class.dark:bg-slate-700]="highlightedIndex() === i"
                class="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-between focus:outline-none focus:bg-indigo-50 dark:focus:bg-slate-700"
                role="menuitem"
                [attr.aria-haspopup]="true"
                [attr.aria-expanded]="expandedSubmenu() === i"
                type="button"
              >
                <span class="flex items-center gap-3">
                  <svg *ngIf="item.icon" class="w-4 h-4" [innerHTML]="item.icon"></svg>
                  {{ item.label }}
                </span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </button>

              <!-- Submenu -->
              <div
                *ngIf="expandedSubmenu() === i"
                class="absolute left-full top-0 ml-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-2xl border border-slate-200 dark:border-slate-700 py-1 animate-in fade-in zoom-in-95 duration-200"
                role="menu"
              >
                <button
                  *ngFor="let subitem of item.submenu"
                  (click)="selectItem(subitem)"
                  class="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-3 focus:outline-none focus:bg-indigo-50 dark:focus:bg-slate-700"
                  role="menuitem"
                  type="button"
                >
                  <svg *ngIf="subitem.icon" class="w-4 h-4" [innerHTML]="subitem.icon"></svg>
                  <span>{{ subitem.label }}</span>
                </button>
              </div>
            </div>

            <!-- Divider -->
            <div
              *ngIf="item.divider"
              class="my-1 border-t border-slate-200 dark:border-slate-700"
              role="separator"
            ></div>
          </ng-container>
        </div>
      </div>
    </div>
  `,
})
export class DropdownComponent implements OnDestroy {
  @Input() triggerLabel = 'Menu';
  @Input() items: DropdownItem[] = [];
  @Input() position: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  @Output() onSelect = new EventEmitter<DropdownItem>();

  @ViewChild('triggerButton') triggerButton: ElementRef | null = null;
  @ViewChild('menu') menu: ElementRef | null = null;

  isOpen = signal(false);
  highlightedIndex = signal(-1);
  expandedSubmenu = signal(-1);
  menuId = `dropdown-menu-${Math.random().toString(36).substr(2, 9)}`;

  private clickOutsideListener: (() => void) | null = null;

  constructor(private elementRef: ElementRef) {
    effect(() => {
      if (this.isOpen()) {
        this.setupClickOutside();
      } else {
        this.removeClickOutside();
      }
    });
  }

  ngOnDestroy(): void {
    this.removeClickOutside();
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
    this.highlightedIndex.set(-1);
    this.expandedSubmenu.set(-1);
  }

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
    this.expandedSubmenu.set(-1);
  }

  selectItem(item: DropdownItem): void {
    this.onSelect.emit(item);
    this.close();
  }

  toggleSubmenu(index: number): void {
    this.expandedSubmenu.update((v) => (v === index ? -1 : index));
  }

  onMenuKeyDown(event: KeyboardEvent): void {
    const visibleItems = this.items.filter((item) => !item.divider);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex.update((v) => {
          const next = v + 1;
          return next < visibleItems.length ? next : 0;
        });
        break;

      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex.update((v) => {
          const prev = v - 1;
          return prev >= 0 ? prev : visibleItems.length - 1;
        });
        break;

      case 'Enter':
      case ' ':
        event.preventDefault();
        const highlighted = visibleItems[this.highlightedIndex()];
        if (highlighted) {
          if (highlighted.submenu) {
            this.toggleSubmenu(this.items.indexOf(highlighted));
          } else {
            this.selectItem(highlighted);
          }
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.close();
        this.triggerButton?.nativeElement.focus();
        break;

      case 'Home':
        event.preventDefault();
        this.highlightedIndex.set(0);
        break;

      case 'End':
        event.preventDefault();
        this.highlightedIndex.set(visibleItems.length - 1);
        break;
    }
  }

  getMenuPositionClasses(): string {
    const positionClasses = {
      top: 'bottom-full mb-2',
      bottom: 'top-full mt-2',
      left: 'right-full mr-2',
      right: 'left-full ml-2',
    };
    return positionClasses[this.position];
  }

  private setupClickOutside(): void {
    this.clickOutsideListener = () => {
      if (!this.elementRef.nativeElement.contains(event?.target)) {
        this.close();
      }
    };
    document.addEventListener('click', this.clickOutsideListener);
  }

  private removeClickOutside(): void {
    if (this.clickOutsideListener) {
      document.removeEventListener('click', this.clickOutsideListener);
      this.clickOutsideListener = null;
    }
  }
}

export interface DropdownItem {
  label: string;
  icon?: string;
  badge?: string;
  divider?: boolean;
  submenu?: DropdownItem[];
}
