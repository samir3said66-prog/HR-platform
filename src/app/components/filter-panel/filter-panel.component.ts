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
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';
import { SelectComponent } from '../select/select.component';
import { DatePickerComponent } from '../date-picker/date-picker.component';

/**
 * Filter Panel Component
 *
 * Advanced filtering system supporting:
 * - Multiple filter criteria (department, region, employment status, performance score, hire date)
 * - Filter presets (save/load)
 * - Filter history
 * - Local storage persistence
 *
 * Requirements: 7.1, 7.2, 7.6, 7.7, 7.8
 */

export interface FilterCriteria {
  department?: string[];
  region?: string[];
  status?: string[];
  employmentStatus?: string[];
  performanceScoreMin?: number;
  performanceScoreMax?: number;
  performanceScoreRange?: [number, number];
  hireDateStart?: string;
  hireDateEnd?: string;
  hireDateRange?: string[];
}

export interface FilterPreset {
  id: string;
  name: string;
  criteria: FilterCriteria;
  createdAt: string;
}

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md dark:shadow-lg p-6">
      <!-- Filter Panel Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Filters</h3>
        <div class="flex items-center gap-2">
          <button
            (click)="toggleAdvanced()"
            class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            [attr.aria-label]="showAdvanced() ? 'Hide advanced filters' : 'Show advanced filters'"
          >
            {{ showAdvanced() ? 'Hide' : 'Show' }} Advanced
          </button>
          <button
            (click)="resetFilters()"
            class="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            aria-label="Reset all filters"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Basic Filters -->
      <div class="space-y-4 mb-6">
        <!-- Department Filter -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Department
          </label>
          <select
            [(ngModel)]="selectedDepartments"
            (change)="onFilterChange()"
            multiple
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            aria-label="Filter by department"
          >
            <option *ngFor="let dept of departments" [value]="dept">{{ dept }}</option>
          </select>
        </div>

        <!-- Region Filter -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Region
          </label>
          <select
            [(ngModel)]="selectedRegions"
            (change)="onFilterChange()"
            multiple
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            aria-label="Filter by region"
          >
            <option *ngFor="let region of regions" [value]="region">{{ region }}</option>
          </select>
        </div>

        <!-- Employment Status Filter -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Employment Status
          </label>
          <select
            [(ngModel)]="selectedStatuses"
            (change)="onFilterChange()"
            multiple
            class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
            aria-label="Filter by employment status"
          >
            <option *ngFor="let status of statuses" [value]="status">{{ status }}</option>
          </select>
        </div>
      </div>

      <!-- Advanced Filters -->
      <div
        *ngIf="showAdvanced()"
        class="space-y-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700"
      >
        <!-- Performance Score Range -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Performance Score Range
          </label>
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <input
                type="number"
                [(ngModel)]="performanceScoreMin"
                (change)="onFilterChange()"
                min="0"
                max="100"
                placeholder="Min"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                aria-label="Minimum performance score"
              />
            </div>
            <span class="text-slate-500 dark:text-slate-400">to</span>
            <div class="flex-1">
              <input
                type="number"
                [(ngModel)]="performanceScoreMax"
                (change)="onFilterChange()"
                min="0"
                max="100"
                placeholder="Max"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                aria-label="Maximum performance score"
              />
            </div>
          </div>
        </div>

        <!-- Hire Date Range -->
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Hire Date Range
          </label>
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <input
                type="date"
                [(ngModel)]="hireDateStart"
                (change)="onFilterChange()"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                aria-label="Hire date start"
              />
            </div>
            <span class="text-slate-500 dark:text-slate-400">to</span>
            <div class="flex-1">
              <input
                type="date"
                [(ngModel)]="hireDateEnd"
                (change)="onFilterChange()"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                aria-label="Hire date end"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Presets -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
            Saved Presets
          </label>
          <button
            (click)="savePreset()"
            class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            aria-label="Save current filter as preset"
          >
            Save Current
          </button>
        </div>
        <div class="space-y-2">
          <div
            *ngFor="let preset of presets()"
            class="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-md"
          >
            <button
              (click)="loadPreset(preset)"
              class="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-left flex-1"
              [attr.aria-label]="'Load preset: ' + preset.name"
            >
              {{ preset.name }}
            </button>
            <button
              (click)="deletePreset(preset.id)"
              class="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              [attr.aria-label]="'Delete preset: ' + preset.name"
            >
              ×
            </button>
          </div>
          <div
            *ngIf="presets().length === 0"
            class="text-sm text-slate-500 dark:text-slate-400 py-2"
          >
            No saved presets
          </div>
        </div>
      </div>

      <!-- Filter History -->
      <div>
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 block">
          Recent Filters
        </label>
        <div class="space-y-2 max-h-40 overflow-y-auto">
          <div
            *ngFor="let history of filterHistory()"
            class="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded-md text-sm"
          >
            <button
              (click)="loadHistory(history)"
              class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-left flex-1"
              [attr.aria-label]="'Load filter from ' + formatDate(history.timestamp)"
            >
              {{ formatDate(history.timestamp) }}
            </button>
            <span class="text-slate-500 dark:text-slate-400 text-xs">
              {{ history.count }} records
            </span>
          </div>
          <div
            *ngIf="filterHistory().length === 0"
            class="text-sm text-slate-500 dark:text-slate-400 py-2"
          >
            No filter history
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FilterPanelComponent implements OnInit, OnDestroy {
  @Output() filterChange = new EventEmitter<FilterCriteria>();

  // Filter options
  departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];
  regions = ['Middle East', 'Europe', 'North America', 'Asia Pacific'];
  statuses = ['Active', 'On Leave', 'Departed'];

  // Signals
  showAdvanced = signal(false);
  selectedDepartments = signal<string[]>([]);
  selectedRegions = signal<string[]>([]);
  selectedStatuses = signal<string[]>([]);
  performanceScoreMin = signal<number | null>(null);
  performanceScoreMax = signal<number | null>(null);
  hireDateStart = signal<string>('');
  hireDateEnd = signal<string>('');
  presets = signal<FilterPreset[]>([]);
  filterHistory = signal<Array<{ criteria: FilterCriteria; timestamp: string; count: number }>>([]);

  ngOnInit(): void {
    this.loadPresetsFromStorage();
    this.loadHistoryFromStorage();
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  toggleAdvanced(): void {
    this.showAdvanced.update((v) => !v);
  }

  onFilterChange(): void {
    const criteria = this.getCurrentCriteria();
    this.filterChange.emit(criteria);
    this.addToHistory(criteria);
  }

  resetFilters(): void {
    this.selectedDepartments.set([]);
    this.selectedRegions.set([]);
    this.selectedStatuses.set([]);
    this.performanceScoreMin.set(null);
    this.performanceScoreMax.set(null);
    this.hireDateStart.set('');
    this.hireDateEnd.set('');
    this.filterChange.emit({});
  }

  savePreset(): void {
    const name = prompt('Enter preset name:');
    if (!name) return;

    const preset: FilterPreset = {
      id: Date.now().toString(),
      name,
      criteria: this.getCurrentCriteria(),
      createdAt: new Date().toISOString(),
    };

    const current = this.presets();
    this.presets.set([...current, preset]);
    this.savePresetsToStorage();
  }

  loadPreset(preset: FilterPreset): void {
    this.selectedDepartments.set(preset.criteria.department || []);
    this.selectedRegions.set(preset.criteria.region || []);
    this.selectedStatuses.set(preset.criteria.employmentStatus || []);
    this.performanceScoreMin.set(preset.criteria.performanceScoreMin || null);
    this.performanceScoreMax.set(preset.criteria.performanceScoreMax || null);
    this.hireDateStart.set(preset.criteria.hireDateStart || '');
    this.hireDateEnd.set(preset.criteria.hireDateEnd || '');
    this.filterChange.emit(preset.criteria);
  }

  deletePreset(id: string): void {
    const current = this.presets();
    this.presets.set(current.filter((p) => p.id !== id));
    this.savePresetsToStorage();
  }

  loadHistory(history: any): void {
    this.filterChange.emit(history.criteria);
  }

  private getCurrentCriteria(): FilterCriteria {
    return {
      department: this.selectedDepartments().length > 0 ? this.selectedDepartments() : undefined,
      region: this.selectedRegions().length > 0 ? this.selectedRegions() : undefined,
      employmentStatus: this.selectedStatuses().length > 0 ? this.selectedStatuses() : undefined,
      performanceScoreMin: this.performanceScoreMin() ?? undefined,
      performanceScoreMax: this.performanceScoreMax() ?? undefined,
      hireDateStart: this.hireDateStart() || undefined,
      hireDateEnd: this.hireDateEnd() || undefined,
    };
  }

  private addToHistory(criteria: FilterCriteria): void {
    const history = this.filterHistory();
    const newEntry = {
      criteria,
      timestamp: new Date().toISOString(),
      count: 0, // This would be set by parent component
    };

    // Keep only last 10 entries
    const updated = [newEntry, ...history].slice(0, 10);
    this.filterHistory.set(updated);
    this.saveHistoryToStorage();
  }

  private savePresetsToStorage(): void {
    localStorage.setItem('filterPresets', JSON.stringify(this.presets()));
  }

  private loadPresetsFromStorage(): void {
    const stored = localStorage.getItem('filterPresets');
    if (stored) {
      try {
        this.presets.set(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load presets from storage', e);
      }
    }
  }

  private saveHistoryToStorage(): void {
    localStorage.setItem('filterHistory', JSON.stringify(this.filterHistory()));
  }

  private loadHistoryFromStorage(): void {
    const stored = localStorage.getItem('filterHistory');
    if (stored) {
      try {
        this.filterHistory.set(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load history from storage', e);
      }
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
