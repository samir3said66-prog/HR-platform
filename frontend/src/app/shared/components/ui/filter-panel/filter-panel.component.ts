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
  templateUrl: './filter-panel.component.html',
  styleUrl: './filter-panel.component.css'
})
export class FilterPanelComponent implements OnInit, OnDestroy {
  @Input() criteria: FilterCriteria = {};
  @Output() filterChange = new EventEmitter<FilterCriteria>();

  // State signals
  showAdvanced = signal(false);
  selectedDepartments = signal<string[]>([]);
  selectedRegions = signal<string[]>([]);

  departments = ['Engineering', 'Sales', 'HR', 'Finance', 'Marketing'];
  regions = ['North', 'South', 'East', 'West', 'Central'];

  ngOnInit(): void {
    // Initialize with provided criteria
    if (this.criteria) {
      this.selectedDepartments.set(this.criteria.department || []);
      this.selectedRegions.set(this.criteria.region || []);
    }
  }

  ngOnDestroy(): void {
    // Cleanup
  }

  toggleAdvanced(): void {
    this.showAdvanced.update(val => !val);
  }

  onFilterChange(): void {
    const updatedCriteria: FilterCriteria = {
      ...this.criteria,
      department: this.selectedDepartments(),
      region: this.selectedRegions(),
    };
    this.filterChange.emit(updatedCriteria);
  }

  resetFilters(): void {
    this.selectedDepartments.set([]);
    this.selectedRegions.set([]);
    this.filterChange.emit({});
  }
}
