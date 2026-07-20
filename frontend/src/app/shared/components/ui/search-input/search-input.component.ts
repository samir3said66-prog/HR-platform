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
  templateUrl: './search-input.component.html',
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
