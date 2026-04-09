import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/card/card.component';
import { ChartComponent, type ChartConfig } from '../../components/chart/chart.component';
import { BadgeComponent } from '../../components/badge/badge.component';

/**
 * Turnover Analysis Dashboard
 *
 * Displays historical turnover rates, trends, patterns, and 6-month predictions
 * with confidence levels segmented by department, region, and role.
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

@Component({
  selector: 'app-turnover',
  standalone: true,
  imports: [CommonModule, CardComponent, ChartComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Turnover Analysis</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">
          Analyze historical turnover patterns and predict future turnover trends
        </p>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Current Turnover Rate
            </p>
            <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {{ currentTurnoverRate() }}%
            </p>
            <app-badge variant="warning" class="mt-3 justify-center">
              ↑ 0.5% from last month
            </app-badge>
          </div>
        </app-card>

        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Departures (This Month)
            </p>
            <p class="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
              {{ departuresThisMonth() }}
            </p>
            <app-badge variant="error" class="mt-3 justify-center">
              ↑ 5% from last month
            </app-badge>
          </div>
        </app-card>

        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Average Tenure</p>
            <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {{ averageTenure() }} yrs
            </p>
            <app-badge variant="success" class="mt-3 justify-center">
              ↑ 0.3 years from last year
            </app-badge>
          </div>
        </app-card>

        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">High Risk Roles</p>
            <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
              {{ highRiskRoles() }}
            </p>
            <app-badge variant="warning" class="mt-3 justify-center">
              Requires attention
            </app-badge>
          </div>
        </app-card>
      </div>

      <!-- Historical Turnover Rates by Department -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              Turnover Rate by Department (24 Months)
            </h2>
            <app-badge variant="info">Bar Chart</app-badge>
          </div>
          <app-chart
            [chartConfig]="turnoverByDepartmentChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Turnover by Region -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              Turnover Rate by Region (24 Months)
            </h2>
            <app-badge variant="info">Bar Chart</app-badge>
          </div>
          <app-chart
            [chartConfig]="turnoverByRegionChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Turnover Trends and Patterns -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              Turnover Trends (24 Months)
            </h2>
            <app-badge variant="warning">↑ Increasing trend</app-badge>
          </div>
          <app-chart
            [chartConfig]="turnoverTrendsChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- 6-Month Turnover Predictions -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              6-Month Turnover Forecast
            </h2>
            <app-badge variant="info">Prediction</app-badge>
          </div>
          <app-chart
            [chartConfig]="turnoverForecastChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Confidence Levels -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <app-card>
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
              Engineering Department
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Predicted Turnover</span>
                <span class="font-semibold text-slate-900 dark:text-white">8.2%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Confidence Level</span>
                <app-badge variant="success">High (92%)</app-badge>
              </div>
            </div>
          </div>
        </app-card>

        <app-card>
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Sales Department</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Predicted Turnover</span>
                <span class="font-semibold text-slate-900 dark:text-white">12.5%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Confidence Level</span>
                <app-badge variant="warning">Medium (78%)</app-badge>
              </div>
            </div>
          </div>
        </app-card>

        <app-card>
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">HR Department</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Predicted Turnover</span>
                <span class="font-semibold text-slate-900 dark:text-white">5.8%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Confidence Level</span>
                <app-badge variant="success">High (88%)</app-badge>
              </div>
            </div>
          </div>
        </app-card>
      </div>

      <!-- Turnover by Role -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              Turnover Rate by Role
            </h2>
            <app-badge variant="info">Bar Chart</app-badge>
          </div>
          <app-chart
            [chartConfig]="turnoverByRoleChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TurnoverComponent implements OnInit {
  currentTurnoverRate = signal<number>(2.3);
  departuresThisMonth = signal<number>(28);
  averageTenure = signal<number>(5.2);
  highRiskRoles = signal<number>(12);

  turnoverByDepartmentChart = signal<ChartConfig>({
    type: 'bar',
    title: 'Turnover Rate by Department',
    data: {
      categories: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'],
      values: [2.1, 4.5, 3.2, 1.8, 2.5, 3.1],
    },
    height: '400px',
  });

  turnoverByRegionChart = signal<ChartConfig>({
    type: 'bar',
    title: 'Turnover Rate by Region',
    data: {
      categories: ['Middle East', 'Europe'],
      values: [2.5, 2.1],
    },
    height: '400px',
  });

  turnoverTrendsChart = signal<ChartConfig>({
    type: 'line',
    title: 'Turnover Trends (Last 24 Months)',
    data: {
      categories: Array.from({ length: 24 }, (_, i) => {
        const months = [
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
        ];
        return months[i % 12] + ' ' + Math.floor(i / 12);
      }),
      values: [
        1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.3, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 2.9,
        2.8, 2.7, 2.6, 2.5, 2.4, 2.3,
      ],
    },
    height: '400px',
  });

  turnoverForecastChart = signal<ChartConfig>({
    type: 'line',
    title: '6-Month Turnover Forecast',
    data: {
      categories: ['Current', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'],
      values: [2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9],
    },
    height: '400px',
  });

  turnoverByRoleChart = signal<ChartConfig>({
    type: 'bar',
    title: 'Turnover Rate by Role',
    data: {
      categories: [
        'Senior Manager',
        'Manager',
        'Senior Developer',
        'Developer',
        'Analyst',
        'Coordinator',
      ],
      values: [1.2, 2.5, 1.8, 3.2, 2.8, 4.1],
    },
    height: '400px',
  });

  ngOnInit(): void {
    this.loadTurnoverData();
  }

  private loadTurnoverData(): void {
    // In a real application, this would fetch data from a service
    // Calculate turnover rate: (departures / avg headcount) × 100
  }

  onChartClick(event: { name: string; value: unknown }): void {
    console.log('Chart clicked:', event);
    // Handle drill-down based on chart click
  }
}
