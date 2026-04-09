import {
  Component,
  Input,
  ChangeDetectionStrategy,
  signal,
  effect,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { BadgeComponent } from '../badge/badge.component';

/**
 * KPI Card Component
 *
 * Displays key performance indicators with:
 * - Animated number transitions
 * - Trend indicators (up/down arrows)
 * - Loading and error states
 * - Real-time data updates
 *
 * Requirements: 1.1, 1.2, 1.6, 2.1, 2.3
 */

export interface KPIData {
  label: string;
  value: number;
  previousValue?: number;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendPercentage?: number;
  loading?: boolean;
  error?: string;
}

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('numberChange', [
      transition(':enter', [style({ opacity: 0, transform: 'scale(0.8)' }), animate('300ms ease-out')]),
      transition(':leave', [animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.8)' }))]),
    ]),
  ],
  template: `
    <div
      class="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow"
    >
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <h3 class="text-sm font-medium text-slate-600 dark:text-slate-400">{{ data.label }}</h3>
        <div *ngIf="data.loading" class="animate-spin">
          <svg
            class="w-4 h-4 text-indigo-600 dark:text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            ></path>
          </svg>
        </div>
      </div>

      <!-- Value -->
      <div class="mb-4">
        <div *ngIf="!data.loading && !data.error" [@numberChange] class="flex items-baseline gap-2">
          <p class="text-3xl font-bold text-slate-900 dark:text-white">
            {{ formatNumber(data.value) }}
          </p>
          <span *ngIf="data.unit" class="text-sm text-slate-600 dark:text-slate-400">
            {{ data.unit }}
          </span>
        </div>

        <div *ngIf="data.error" class="text-sm text-red-600 dark:text-red-400">
          {{ data.error }}
        </div>
      </div>

      <!-- Trend Indicator -->
      <div *ngIf="!data.loading && !data.error && data.trend" class="flex items-center gap-2">
        <span
          [ngClass]="{
            'text-emerald-600 dark:text-emerald-400': data.trend === 'up',
            'text-red-600 dark:text-red-400': data.trend === 'down',
            'text-slate-600 dark:text-slate-400': data.trend === 'neutral',
          }"
        >
          <span *ngIf="data.trend === 'up'">↑</span>
          <span *ngIf="data.trend === 'down'">↓</span>
          <span *ngIf="data.trend === 'neutral'">→</span>
        </span>
        <span
          *ngIf="data.trendPercentage"
          [ngClass]="{
            'text-emerald-600 dark:text-emerald-400': data.trend === 'up',
            'text-red-600 dark:text-red-400': data.trend === 'down',
            'text-slate-600 dark:text-slate-400': data.trend === 'neutral',
          }"
          class="text-sm font-medium"
        >
          {{ Math.abs(data.trendPercentage) }}% from last period
        </span>
      </div>

      <!-- Previous Value (for comparison) -->
      <div *ngIf="data.previousValue !== undefined && !data.loading && !data.error" class="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <p class="text-xs text-slate-500 dark:text-slate-500">
          Previous: {{ formatNumber(data.previousValue) }}
        </p>
      </div>
    </div>
  `,
})
export class KPICardComponent implements OnInit {
  @Input() data: KPIData = {
    label: 'Metric',
    value: 0,
  };

  Math = Math;

  ngOnInit(): void {
    // Component initialization
  }

  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toLocaleString();
  }
}
