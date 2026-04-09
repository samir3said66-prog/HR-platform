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
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

/**
 * Data Table Component with Virtual Scrolling
 *
 * A high-performance data table component supporting:
 * - Virtual scrolling for 10,000+ records
 * - Dynamic column definitions
 * - Sorting functionality
 * - Pagination controls
 * - Expandable row details
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 16.1, 16.2
 */

export interface ColumnDefinition {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
  template?: (value: any, row: any) => string;
}

export interface SortState {
  column: string | null;
  direction: 'asc' | 'desc';
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, ScrollingModule, FormsModule, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col h-full bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-lg"
    >
      <!-- Table Header with Controls -->
      <div
        class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700"
      >
        <div class="flex items-center gap-4">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            {{ title }}
          </h3>
          <span class="text-sm text-slate-500 dark:text-slate-400">
            {{ filteredData().length }} records
          </span>
        </div>
        <div class="flex items-center gap-2">
          <select
            [(ngModel)]="pageSize"
            (change)="onPageSizeChange()"
            class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            aria-label="Items per page"
          >
            <option value="10">10 items</option>
            <option value="25">25 items</option>
            <option value="50">50 items</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="flex-1 overflow-hidden">
        <div class="flex flex-col h-full">
          <!-- Column Headers -->
          <div
            class="flex bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10"
          >
            <div class="w-12 px-4 py-3 flex items-center justify-center">
              <input
                type="checkbox"
                [checked]="allSelected()"
                (change)="toggleSelectAll()"
                aria-label="Select all rows"
                class="w-4 h-4"
              />
            </div>
            <div
              *ngFor="let column of columns"
              [style.width]="column.width || 'auto'"
              class="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              <button
                *ngIf="column.sortable"
                (click)="onSort(column.key)"
                class="flex items-center gap-2 hover:text-slate-900 dark:hover:text-white transition-colors"
                [attr.aria-label]="'Sort by ' + column.label"
              >
                {{ column.label }}
                <span
                  *ngIf="sortState().column === column.key"
                  class="text-indigo-600 dark:text-indigo-400"
                >
                  {{ sortState().direction === 'asc' ? '↑' : '↓' }}
                </span>
              </button>
              <span *ngIf="!column.sortable">{{ column.label }}</span>
            </div>
            <div class="w-12 px-4 py-3"></div>
          </div>

          <!-- Virtual Scrolled Rows -->
          <cdk-virtual-scroll-viewport
            [itemSize]="48"
            class="flex-1"
            [attr.aria-label]="'Data table with ' + filteredData().length + ' rows'"
          >
            <div
              *cdkVirtualFor="let row of paginatedData()"
              class="flex border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <div class="w-12 px-4 py-3 flex items-center justify-center">
                <input
                  type="checkbox"
                  [checked]="isRowSelected(row.id)"
                  (change)="toggleRowSelection(row.id)"
                  [attr.aria-label]="'Select row ' + row.id"
                  class="w-4 h-4"
                />
              </div>
              <div
                *ngFor="let column of columns"
                [style.width]="column.width || 'auto'"
                class="px-4 py-3 text-sm text-slate-900 dark:text-slate-100"
              >
                {{ column.template ? column.template(row[column.key], row) : row[column.key] }}
              </div>
              <div class="w-12 px-4 py-3 flex items-center justify-center">
                <button
                  (click)="toggleRowExpanded(row.id)"
                  class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
                  [attr.aria-label]="'Expand row ' + row.id"
                >
                  {{ isRowExpanded(row.id) ? '−' : '+' }}
                </button>
              </div>
            </div>

            <!-- Expandable Row Details -->
            <ng-container *ngFor="let row of paginatedData()">
              <div
                *ngIf="isRowExpanded(row.id)"
                class="bg-slate-50 dark:bg-slate-900 px-4 py-4 border-b border-slate-200 dark:border-slate-700"
              >
                <ng-container *ngIf="expandedRowTemplate">
                  <ng-container
                    *ngTemplateOutlet="expandedRowTemplate; context: { $implicit: row }"
                  ></ng-container>
                </ng-container>
                <div
                  *ngIf="!expandedRowTemplate"
                  class="text-sm text-slate-600 dark:text-slate-400"
                >
                  <div *ngFor="let column of columns" class="flex justify-between py-1">
                    <span class="font-medium">{{ column.label }}:</span>
                    <span>{{
                      column.template ? column.template(row[column.key], row) : row[column.key]
                    }}</span>
                  </div>
                </div>
              </div>
            </ng-container>
          </cdk-virtual-scroll-viewport>
        </div>
      </div>

      <!-- Pagination Controls -->
      <div
        class="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
      >
        <div class="text-sm text-slate-600 dark:text-slate-400">
          Showing {{ currentPageStart() + 1 }} to {{ currentPageEnd() }} of
          {{ filteredData().length }}
        </div>
        <div class="flex items-center gap-2">
          <button
            (click)="previousPage()"
            [disabled]="currentPage() === 0"
            class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            ← Previous
          </button>
          <span class="text-sm text-slate-600 dark:text-slate-400">
            Page {{ currentPage() + 1 }} of {{ totalPages() }}
          </span>
          <button
            (click)="nextPage()"
            [disabled]="currentPage() >= totalPages() - 1"
            class="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  `,
})
export class DataTableComponent implements OnInit, OnDestroy {
  @Input() title = 'Data Table';
  @Input() columns: ColumnDefinition[] = [];
  @Input() data: any[] = [];
  @Input() expandedRowTemplate: any;

  @Output() sortChange = new EventEmitter<SortState>();
  @Output() rowSelectionChange = new EventEmitter<string[]>();
  @Output() rowExpanded = new EventEmitter<string>();

  // Signals
  pageSize = signal(10);
  currentPage = signal(0);
  sortState = signal<SortState>({ column: null, direction: 'asc' });
  selectedRows = signal<Set<string>>(new Set());
  expandedRows = signal<Set<string>>(new Set());

  // Computed
  filteredData = computed(() => {
    let result = [...this.data];

    // Apply sorting
    const sort = this.sortState();
    if (sort.column !== null) {
      const column = sort.column;
      result.sort((a, b) => {
        const aVal = a[column];
        const bVal = b[column];

        if (aVal < bVal) return sort.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sort.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  });

  paginatedData = computed(() => {
    const filtered = this.filteredData();
    const start = this.currentPage() * this.pageSize();
    return filtered.slice(start, start + this.pageSize());
  });

  totalPages = computed(() => {
    return Math.ceil(this.filteredData().length / this.pageSize());
  });

  currentPageStart = computed(() => {
    return this.currentPage() * this.pageSize();
  });

  currentPageEnd = computed(() => {
    return Math.min(this.currentPageStart() + this.pageSize(), this.filteredData().length);
  });

  allSelected = computed(() => {
    const paginated = this.paginatedData();
    if (paginated.length === 0) return false;
    return paginated.every((row) => this.selectedRows().has(row.id));
  });

  ngOnInit(): void {
    // Initialize component
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  onSort(column: string): void {
    const current = this.sortState();
    let direction: 'asc' | 'desc' = 'asc';

    if (current.column === column && current.direction === 'asc') {
      direction = 'desc';
    }

    this.sortState.set({ column, direction });
    this.sortChange.emit(this.sortState());
  }

  onPageSizeChange(): void {
    this.currentPage.set(0);
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages() - 1) {
      this.currentPage.update((p) => p + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 0) {
      this.currentPage.update((p) => p - 1);
    }
  }

  toggleRowSelection(rowId: string): void {
    const selected = new Set(this.selectedRows());
    if (selected.has(rowId)) {
      selected.delete(rowId);
    } else {
      selected.add(rowId);
    }
    this.selectedRows.set(selected);
    this.rowSelectionChange.emit(Array.from(selected));
  }

  toggleSelectAll(): void {
    const paginated = this.paginatedData();
    const selected = new Set(this.selectedRows());

    if (this.allSelected()) {
      paginated.forEach((row) => selected.delete(row.id));
    } else {
      paginated.forEach((row) => selected.add(row.id));
    }

    this.selectedRows.set(selected);
    this.rowSelectionChange.emit(Array.from(selected));
  }

  isRowSelected(rowId: string): boolean {
    return this.selectedRows().has(rowId);
  }

  toggleRowExpanded(rowId: string): void {
    const expanded = new Set(this.expandedRows());
    if (expanded.has(rowId)) {
      expanded.delete(rowId);
    } else {
      expanded.add(rowId);
    }
    this.expandedRows.set(expanded);
    this.rowExpanded.emit(rowId);
  }

  isRowExpanded(rowId: string): boolean {
    return this.expandedRows().has(rowId);
  }
}
