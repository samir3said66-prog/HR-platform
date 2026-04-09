import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/card/card.component';
import { ChartComponent, type ChartConfig } from '../../components/chart/chart.component';
import { BadgeComponent } from '../../components/badge/badge.component';

/**
 * Performance Analytics Dashboard
 *
 * Displays employee performance metrics including distribution, trends, ratings,
 * performance vs salary analysis, and departmental comparisons.
 *
 * Requirements: 1.1, 1.2, 1.6, 2.1
 */

@Component({
  selector: 'app-performance',
  standalone: true,
  imports: [CommonModule, CardComponent, ChartComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Performance Analytics</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">
          Track employee performance metrics, trends, and departmental comparisons
        </p>
      </div>

      <!-- Performance Distribution Histogram -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              Performance Distribution
            </h2>
            <app-badge variant="info">Histogram</app-badge>
          </div>
          <app-chart
            [chartConfig]="performanceDistributionChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Performance Trends Over Time -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              Performance Trends (12 Months)
            </h2>
            <app-badge variant="success">↑ 3.2% improvement</app-badge>
          </div>
          <app-chart
            [chartConfig]="performanceTrendsChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Two Column Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Performance Rating Breakdown -->
        <app-card>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
                Rating Breakdown
              </h2>
              <app-badge variant="info">Pie Chart</app-badge>
            </div>
            <app-chart
              [chartConfig]="performanceRatingChart()"
              (chartClick)="onChartClick($event)"
            ></app-chart>
          </div>
        </app-card>

        <!-- Performance vs Salary Analysis -->
        <app-card>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
                Performance vs Salary
              </h2>
              <app-badge variant="info">Scatter Plot</app-badge>
            </div>
            <app-chart
              [chartConfig]="performanceVsSalaryChart()"
              (chartClick)="onChartClick($event)"
            ></app-chart>
          </div>
        </app-card>
      </div>

      <!-- Performance Comparison by Department -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              Performance by Department
            </h2>
            <app-badge variant="info">Bar Chart</app-badge>
          </div>
          <app-chart
            [chartConfig]="departmentComparisonChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Performance Metrics Summary -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Average Performance Score
            </p>
            <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {{ averagePerformanceScore() }}
            </p>
            <app-badge variant="success" class="mt-3 justify-center">
              ↑ 2.1% from last quarter
            </app-badge>
          </div>
        </app-card>

        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              High Performers
            </p>
            <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {{ highPerformersCount() }}
            </p>
            <app-badge variant="success" class="mt-3 justify-center">
              ↑ 5.3% from last quarter
            </app-badge>
          </div>
        </app-card>

        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Needs Improvement
            </p>
            <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
              {{ needsImprovementCount() }}
            </p>
            <app-badge variant="warning" class="mt-3 justify-center">
              ↓ 1.2% from last quarter
            </app-badge>
          </div>
        </app-card>

        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Performance Reviews Completed
            </p>
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {{ reviewsCompletedPercentage() }}%
            </p>
            <app-badge variant="info" class="mt-3 justify-center">
              ↑ 8.5% from last quarter
            </app-badge>
          </div>
        </app-card>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PerformanceComponent implements OnInit {
  performanceDistributionChart = signal<ChartConfig>({
    type: 'bar',
    title: 'Performance Score Distribution',
    data: {
      categories: ['0-20', '20-40', '40-60', '60-80', '80-100'],
      values: [45, 120, 380, 650, 805],
    },
    height: '400px',
  });

  performanceTrendsChart = signal<ChartConfig>({
    type: 'line',
    title: 'Performance Trends (Last 12 Months)',
    data: {
      categories: [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ],
      values: [68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79],
    },
    height: '400px',
  });

  performanceRatingChart = signal<ChartConfig>({
    type: 'pie',
    title: 'Performance Rating Distribution',
    data: {
      values: [
        { value: 805, name: 'Excellent (80-100)' },
        { value: 650, name: 'Good (60-80)' },
        { value: 380, name: 'Average (40-60)' },
        { value: 120, name: 'Below Average (20-40)' },
        { value: 45, name: 'Poor (0-20)' },
      ],
    },
    height: '400px',
  });

  performanceVsSalaryChart = signal<ChartConfig>({
    type: 'scatter',
    title: 'Performance vs Salary Analysis',
    data: {
      values: [
        [45000, 65],
        [50000, 72],
        [55000, 78],
        [60000, 82],
        [65000, 85],
        [70000, 88],
        [75000, 90],
        [80000, 92],
        [85000, 94],
        [90000, 96],
      ],
    },
    options: {
      xAxis: {
        name: 'Salary ($)',
        type: 'value',
      },
      yAxis: {
        name: 'Performance Score',
        type: 'value',
      },
    },
    height: '400px',
  });

  departmentComparisonChart = signal<ChartConfig>({
    type: 'bar',
    title: 'Average Performance Score by Department',
    data: {
      categories: [
        'Engineering',
        'Sales',
        'Marketing',
        'HR',
        'Finance',
        'Operations',
      ],
      values: [82, 75, 78, 80, 79, 76],
    },
    height: '400px',
  });

  averagePerformanceScore = signal<number>(79);
  highPerformersCount = signal<number>(805);
  needsImprovementCount = signal<number>(165);
  reviewsCompletedPercentage = signal<number>(94);

  ngOnInit(): void {
    // In a real application, this would fetch data from a service
    this.loadPerformanceData();
  }

  private loadPerformanceData(): void {
    // Simulate data loading
    // In production, this would call an analytics service
  }

  onChartClick(event: { name: string; value: unknown }): void {
    console.log('Chart clicked:', event);
    // Handle drill-down or navigation based on chart click
  }
}
