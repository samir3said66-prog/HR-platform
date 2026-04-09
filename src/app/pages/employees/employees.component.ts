import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  DataTableComponent,
  SearchInputComponent,
  FilterPanelComponent,
  CardComponent,
  BadgeComponent,
  ColumnDefinition,
  SearchResult,
  FilterCriteria,
} from '../../components';
import { AppState } from '../../store/app.state';
import { selectAllEmployees } from '../../store/employees/employees.selectors';

/**
 * Employee Analytics Page Component
 *
 * Displays employee records with:
 * - Virtual scrolling for 10,000+ records
 * - Advanced filtering by department, region, status, performance
 * - Full-text search with field-specific search
 * - Real-time data updates
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 7.4, 7.5
 */

export interface Employee extends SearchResult {
  id: string;
  name: string;
  email: string;
  department: string;
  region: string;
  role: string;
  employmentStatus: 'active' | 'on-leave' | 'departed';
  performanceScore?: number;
  hireDate: string;
}

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    SearchInputComponent,
    FilterPanelComponent,
    CardComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Employee Analytics</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">
          View and analyze employee records with advanced filtering and search
        </p>
      </div>

      <!-- Search and Filter Controls -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Search -->
        <div class="lg:col-span-2">
          <app-search-input
            placeholder="Search employees by name, email, department..."
            [data]="employees()"
            [searchableFields]="['name', 'email', 'department', 'role']"
            (search)="onSearch($event)"
            (queryChange)="onSearchQueryChange($event)"
          ></app-search-input>
        </div>

        <!-- Quick Stats -->
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Employees</p>
            <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {{ filteredEmployees().length }}
            </p>
          </div>
        </app-card>
      </div>

      <!-- Filters and Table -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Filter Panel -->
        <div class="lg:col-span-1">
          <app-filter-panel
            (filterChange)="onFilterChange($event)"
          ></app-filter-panel>
        </div>

        <!-- Data Table -->
        <div class="lg:col-span-3">
          <app-data-table
            title="Employee Records"
            [data]="filteredEmployees()"
            [columns]="tableColumns"
          ></app-data-table>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Active</p>
            <p class="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {{ activeEmployeesCount() }}
            </p>
          </div>
        </app-card>

        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">On Leave</p>
            <p class="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
              {{ onLeaveCount() }}
            </p>
          </div>
        </app-card>

        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Performance</p>
            <p class="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {{ averagePerformance() }}
            </p>
          </div>
        </app-card>

        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Departments</p>
            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {{ uniqueDepartments() }}
            </p>
          </div>
        </app-card>
      </div>
    </div>
  `,
})
export class EmployeesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Signals
  employees = signal<Employee[]>([]);
  searchResults = signal<Employee[]>([]);
  filteredEmployees = computed(() => {
    const results = this.searchResults().length > 0 ? this.searchResults() : this.employees();
    return this.applyFilters(results);
  });

  // Filter state
  currentFilters = signal<FilterCriteria>({
    department: [],
    region: [],
    status: [],
    performanceScoreRange: [0, 100],
    hireDateRange: [],
  });

  // Table columns
  tableColumns: ColumnDefinition[] = [
    { key: 'name', label: 'Name', width: '200px', sortable: true },
    { key: 'email', label: 'Email', width: '200px', sortable: true },
    { key: 'department', label: 'Department', width: '150px', sortable: true },
    { key: 'role', label: 'Role', width: '150px', sortable: true },
    { key: 'employmentStatus', label: 'Status', width: '120px', sortable: true },
    {
      key: 'performanceScore',
      label: 'Performance',
      width: '120px',
      sortable: true,
      template: (value: number) => `${value}/100`,
    },
    {
      key: 'hireDate',
      label: 'Hire Date',
      width: '120px',
      sortable: true,
      template: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  // Computed stats
  activeEmployeesCount = computed(() =>
    this.filteredEmployees().filter((e) => e.employmentStatus === 'active').length,
  );

  onLeaveCount = computed(() =>
    this.filteredEmployees().filter((e) => e.employmentStatus === 'on-leave').length,
  );

  averagePerformance = computed(() => {
    const employees = this.filteredEmployees();
    const withScores = employees.filter((e) => e.performanceScore !== undefined);
    if (withScores.length === 0) return 0;
    const sum = withScores.reduce((acc, e) => acc + (e.performanceScore || 0), 0);
    return Math.round(sum / withScores.length);
  });

  uniqueDepartments = computed(() => {
    const departments = new Set(this.filteredEmployees().map((e) => e.department));
    return departments.size;
  });

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    // Load employees from store
    this.store
      .select(selectAllEmployees)
      .pipe(takeUntil(this.destroy$))
      .subscribe((employees) => {
        this.employees.set(employees);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearch(results: SearchResult[]): void {
    this.searchResults.set(results as Employee[]);
  }

  onSearchQueryChange(query: string): void {
    // Handle search query changes if needed
  }

  onFilterChange(filters: FilterCriteria): void {
    this.currentFilters.set(filters);
  }

  private applyFilters(data: Employee[]): Employee[] {
    const filters = this.currentFilters();

    return data.filter((employee) => {
      // Department filter
      if (filters.department && filters.department.length > 0) {
        if (!filters.department.includes(employee.department)) {
          return false;
        }
      }

      // Region filter
      if (filters.region && filters.region.length > 0) {
        if (!filters.region.includes(employee.region)) {
          return false;
        }
      }

      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(employee.employmentStatus)) {
          return false;
        }
      }

      // Performance score range filter
      if (filters.performanceScoreRange && employee.performanceScore !== undefined) {
        const [min, max] = filters.performanceScoreRange;
        if (employee.performanceScore < min || employee.performanceScore > max) {
          return false;
        }
      }

      return true;
    });
  }
}
