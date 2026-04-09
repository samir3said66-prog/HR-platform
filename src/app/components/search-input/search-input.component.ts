import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

/**
 * Search Input Component
 *
 * Full-text search with:
 * - Field-specific search (field:value syntax)
 * - Debounced input (300ms)
 * - Real-time search results
 *
 * Requirements: 7.3, 7.4, 7.5
 */

export interface SearchResult {
  id: string;
  [key: string]: any;
}

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <div
        class="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500"
      >
        <svg
          class="w-5 h-5 text-slate-400 dark:text-slate-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          ></path>
        </svg>
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
          [placeholder]="placeholder"
          class="flex-1 bg-transparent text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none text-sm"
          [attr.aria-label]="'Search ' + placeholder"
          autocomplete="off"
        />
        <button
          *ngIf="searchQuery"
          (click)="clearSearch()"
          class="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          aria-label="Clear search"
        >
          ×
        </button>
      </div>

      <!-- Search Suggestions -->
      <div
        *ngIf="showSuggestions() && suggestions().length > 0"
        class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
      >
        <div
          *ngFor="let suggestion of suggestions()"
          class="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer transition-colors"
        >
          <button
            (click)="selectSuggestion(suggestion)"
            class="w-full text-left text-sm text-slate-900 dark:text-white"
            [attr.aria-label]="'Select ' + suggestion"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- Search Help -->
      <div
        *ngIf="showHelp()"
        class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-10 p-3"
      >
        <p class="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Search Tips:</p>
        <ul class="text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <li>• Type to search across all fields</li>
          <li>
            • Use <code class="bg-slate-100 dark:bg-slate-800 px-1 rounded">field:value</code> for
            specific fields
          </li>
          <li>
            • Example:
            <code class="bg-slate-100 dark:bg-slate-800 px-1 rounded">department:Engineering</code>
          </li>
        </ul>
      </div>
    </div>
  `,
})
export class SearchInputComponent implements OnInit, OnDestroy {
  @Input() placeholder = 'Search employees...';
  @Input() data: SearchResult[] = [];
  @Input() searchableFields: string[] = ['name', 'email', 'department', 'role'];

  @Output() search = new EventEmitter<SearchResult[]>();
  @Output() queryChange = new EventEmitter<string>();

  // Signals
  searchQuery = signal('');
  suggestions = signal<string[]>([]);
  showSuggestions = signal(false);
  showHelp = signal(false);

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.performSearch(query);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.queryChange.emit(query);

    if (query.length > 0) {
      this.showHelp.set(false);
      this.generateSuggestions(query);
      this.searchSubject.next(query);
    } else {
      this.showSuggestions.set(false);
      this.showHelp.set(true);
      this.search.emit(this.data);
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.showSuggestions.set(false);
    this.showHelp.set(true);
    this.search.emit(this.data);
    this.queryChange.emit('');
  }

  selectSuggestion(suggestion: string): void {
    this.searchQuery.set(suggestion);
    this.showSuggestions.set(false);
    this.performSearch(suggestion);
  }

  private performSearch(query: string): void {
    if (!query) {
      this.search.emit(this.data);
      return;
    }

    const results = this.executeSearch(query);
    this.search.emit(results);
  }

  private executeSearch(query: string): SearchResult[] {
    // Check for field-specific search (field:value syntax)
    const fieldMatch = query.match(/^(\w+):(.+)$/);

    if (fieldMatch) {
      const [, field, value] = fieldMatch;
      return this.searchByField(field, value);
    }

    // Full-text search across all searchable fields
    return this.fullTextSearch(query);
  }

  private searchByField(field: string, value: string): SearchResult[] {
    const lowerValue = value.toLowerCase();
    return this.data.filter((item) => {
      const fieldValue = item[field];
      if (!fieldValue) return false;
      return String(fieldValue).toLowerCase().includes(lowerValue);
    });
  }

  private fullTextSearch(query: string): SearchResult[] {
    const lowerQuery = query.toLowerCase();
    return this.data.filter((item) => {
      return this.searchableFields.some((field) => {
        const value = item[field];
        if (!value) return false;
        return String(value).toLowerCase().includes(lowerQuery);
      });
    });
  }

  private generateSuggestions(query: string): void {
    const suggestions = new Set<string>();
    const lowerQuery = query.toLowerCase();

    // Generate suggestions from searchable fields
    this.data.forEach((item) => {
      this.searchableFields.forEach((field) => {
        const value = item[field];
        if (value) {
          const strValue = String(value).toLowerCase();
          if (strValue.includes(lowerQuery) && suggestions.size < 5) {
            suggestions.add(String(value));
          }
        }
      });
    });

    // Add field-specific suggestions
    if (!query.includes(':')) {
      this.searchableFields.forEach((field) => {
        if (field.toLowerCase().includes(lowerQuery)) {
          suggestions.add(`${field}:`);
        }
      });
    }

    this.suggestions.set(Array.from(suggestions).slice(0, 5));
    this.showSuggestions.set(suggestions.size > 0);
  }
}
