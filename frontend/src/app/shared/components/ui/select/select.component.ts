import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  signal,
  computed,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

/**
 * Select Component
 *
 * A reusable select component with single/multi-select modes, search functionality,
 * and proper ARIA labels and keyboard navigation.
 *
 * Requirements: 2.3, 8.2, 8.3, 14.1, 14.2
 */
@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select.component.html',
})
export class SelectComponent implements OnInit {
  @Input() id = 'select-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string | null = null;
  @Input() ariaLabel: string | null = null;
  @Input() options: SelectOption[] = [];
  @Input() multiple = false;
  @Input() searchable = false;
  @Input() disabled = false;
  @Input() error: string | null = null;
  @Input() placeholder = 'Select an option';
  @Output() selectionChange = new EventEmitter<any>();

  @ViewChild('searchInput') searchInput: ElementRef | null = null;

  isOpen = signal(false);
  selectedValues = signal<any[]>([]);
  searchQuery = signal('');

  ngOnInit() {
    // Initialize with any pre-selected values if needed
  }

  toggleOpen() {
    if (!this.disabled) {
      this.isOpen.set(!this.isOpen());
      if (this.isOpen() && this.searchable) {
        setTimeout(() => this.searchInput?.nativeElement?.focus());
      }
    }
  }

  selectOption(option: SelectOption) {
    if (option.disabled) return;

    if (this.multiple) {
      const values = this.selectedValues();
      const index = values.findIndex((v) => v === option.value);
      if (index > -1) {
        values.splice(index, 1);
      } else {
        values.push(option.value);
      }
      this.selectedValues.set([...values]);
    } else {
      this.selectedValues.set([option.value]);
      this.isOpen.set(false);
    }

    this.selectionChange.emit(this.multiple ? this.selectedValues() : option.value);
  }

  isSelected(option: SelectOption): boolean {
    return this.selectedValues().includes(option.value);
  }

  getDisplayValue(): string {
    const values = this.selectedValues();
    if (values.length === 0) return this.placeholder;

    const labels = values
      .map((v) => this.options.find((o) => o.value === v)?.label)
      .filter(Boolean);

    if (this.multiple) {
      return labels.length > 0 ? `${labels.length} selected` : this.placeholder;
    }
    return labels[0] || this.placeholder;
  }

  groupedOptions = computed(() => {
    let filtered = this.options;

    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter((o) => o.label.toLowerCase().includes(query));
    }

    const groups: SelectOptionGroup[] = [];
    const grouped = new Map<string, SelectOption[]>();

    filtered.forEach((option) => {
      const groupLabel = option.group || '';
      if (!grouped.has(groupLabel)) {
        grouped.set(groupLabel, []);
      }
      grouped.get(groupLabel)!.push(option);
    });

    grouped.forEach((opts, label) => {
      groups.push({ label, options: opts });
    });

    return groups;
  });

  onSearchInput() {
    // Trigger computed update
    this.searchQuery.set(this.searchQuery());
  }

  handleKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.toggleOpen();
        break;
      case 'Escape':
        event.preventDefault();
        this.isOpen.set(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen()) this.toggleOpen();
        break;
    }
  }

  handleOptionKeydown(event: KeyboardEvent, index: number) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        const options = this.groupedOptions().flatMap((g) => g.options);
        if (options[index]) {
          this.selectOption(options[index]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        this.isOpen.set(false);
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(`#${this.id}`) && !target.closest(`#${this.id}-listbox`)) {
      this.isOpen.set(false);
    }
  }

  getSelectButtonClasses(): string {
    return `w-full px-4 py-2 text-left bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between transition-colors ${this.isOpen() ? 'ring-2 ring-indigo-500' : ''}`;
  }

  getDropdownClasses(): string {
    return `absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto ${this.searchable ? 'pt-10' : ''}`;
  }

  getOptionClasses(option: SelectOption): string {
    const isSelected = this.isSelected(option);
    return `w-full text-left px-3 py-2 text-slate-900 dark:text-slate-100 hover:bg-indigo-50 dark:hover:bg-slate-700 focus:outline-none focus:bg-indigo-50 dark:focus:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${isSelected ? 'bg-indigo-100 dark:bg-indigo-900' : ''}`;
  }
}
