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
