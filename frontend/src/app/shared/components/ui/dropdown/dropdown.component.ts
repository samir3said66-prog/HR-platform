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
  templateUrl: './dropdown.component.html',
  styles: [`
    :host { display: inline-block; }

    /* Dropdown container */
    .relative { position: relative; display: inline-block; }

    /* Trigger button */
    button:first-of-type {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--color-primary);
      color: white;
      border-radius: var(--radius-base);
      border: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      transition: background var(--t-fast), box-shadow var(--t-fast);
      cursor: pointer;
      white-space: nowrap;
      min-width: fit-content;
    }

    button:first-of-type:hover {
      background: var(--color-primary-hover);
      box-shadow: 0 3px 8px rgba(79,110,247,0.3);
      transform: translateY(-1px);
    }

    button:first-of-type:active {
      transform: translateY(0);
    }

    button:first-of-type:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }

    /* Dropdown menu container */
    .absolute {
      position: absolute;
      z-index: 200;
      width: 200px;
      max-height: 70vh;
      overflow-y: auto;
      background: var(--surface-card);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--surface-border);
      animation: slideDown 200ms ease-out forwards;
      right: 0;
    }

    /* On mobile, make it full width with constraint */
    @media (max-width: 640px) {
      .absolute {
        position: fixed;
        left: 12px;
        right: 12px;
        width: auto;
        max-width: calc(100vw - 24px);
        max-height: 60vh;
      }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Menu items container */
    div[role="menu"] > div {
      padding: 0.25rem 0;
    }

    /* Menu items */
    button[role="menuitem"] {
      width: 100%;
      text-align: left;
      padding: 0.75rem 1rem;
      color: var(--gray-700);
      background: transparent;
      border: none;
      font-size: var(--font-size-sm);
      transition: background var(--t-fast), color var(--t-fast);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: inherit;
      min-height: 40px;
    }

    button[role="menuitem"]:hover {
      background: var(--gray-100);
      color: var(--gray-900);
    }

    button[role="menuitem"]:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: -2px;
      background: var(--gray-100);
    }

    button[role="menuitem"] svg {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }

    /* Badge styling */
    .badge {
      margin-left: auto;
      font-size: var(--font-size-xs);
      background: var(--color-primary);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Divider */
    div[role="separator"] {
      margin: 0.25rem 0;
      border-top: 1px solid var(--surface-divider);
    }

    /* Submenu styling */
    div.relative.group {
      position: relative;
    }

    div[role="menu"][class*="left-full"] {
      position: absolute;
      left: 100%;
      top: 0;
      margin-left: 0.25rem;
      margin-top: 0;
    }

    /* Scrollbar styling */
    .absolute::-webkit-scrollbar {
      width: 6px;
    }

    .absolute::-webkit-scrollbar-track {
      background: transparent;
    }

    .absolute::-webkit-scrollbar-thumb {
      background: var(--gray-300);
      border-radius: 3px;
    }

    .absolute::-webkit-scrollbar-thumb:hover {
      background: var(--gray-400);
    }

    /* Dark mode */
    :host-context(.dark) .absolute {
      background: var(--surface-card);
      border-color: var(--surface-border);
    }

    :host-context(.dark) button[role="menuitem"] {
      color: var(--gray-300);
    }

    :host-context(.dark) button[role="menuitem"]:hover {
      background: var(--gray-200);
      color: var(--gray-800);
    }

    :host-context(.dark) .absolute::-webkit-scrollbar-thumb {
      background: var(--gray-600);
    }

    :host-context(.dark) .absolute::-webkit-scrollbar-thumb:hover {
      background: var(--gray-500);
    }
  `],
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
  menuPositionClass = signal('bottom-full');

  private clickOutsideListener: (() => void) | null = null;

  constructor(private elementRef: ElementRef) {
    effect(() => {
      if (this.isOpen()) {
        this.setupClickOutside();
        setTimeout(() => this.calculateMenuPosition(), 0);
      } else {
        this.removeClickOutside();
      }
    });
  }

  private calculateMenuPosition(): void {
    if (!this.menu || !this.triggerButton) return;

    const trigger = this.triggerButton.nativeElement.getBoundingClientRect();
    const viewport = window.innerHeight;
    const menuHeight = 300; // Approximate height

    // Check if there's enough space below
    const spaceBelow = viewport - trigger.bottom;
    const spaceAbove = trigger.top;

    // If not enough space below, show above
    if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
      this.menuPositionClass.set('bottom-full mb-2');
    } else {
      this.menuPositionClass.set('top-full mt-2');
    }
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
    return this.menuPositionClass();
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
