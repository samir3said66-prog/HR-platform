import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/card/card.component';
import { ChartComponent, type ChartConfig } from '../../components/chart/chart.component';
import { BadgeComponent } from '../../components/badge/badge.component';

/**
 * Workforce Metrics Dashboard
 *
 * Displays key workforce metrics including headcount, active employees, on leave,
 * new hires, departures, and historical trends segmented by region, department,
 * and employment status.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 */

@Component({
  selector: 'app-workforce',
  standalone: true,
  imports: [CommonModule, CardComponent, ChartComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Workforce Metrics</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">
          Monitor key workforce indicators and trends across regions and departments
        </p>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <!-- Total Headcount -->
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Headcount</p>
            <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {{ totalHeadcount() | number }}
            </p>
            <app-badge variant="success" class="mt-3 justify-center">
              ↑ 2.5% from last month
            </app-badge>
          </div>
        </app-card>

        <!-- Active Employees -->
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Active Employees</p>
            <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {{ activeEmployees() | number }}
            </p>
            <app-badge variant="success" class="mt-3 justify-center">
              ↑ 1.2% from last month
            </app-badge>
          </div>
        </app-card>

        <!-- On Leave -->
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">On Leave</p>
            <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">
              {{ onLeave() | number }}
            </p>
            <app-badge variant="warning" class="mt-3 justify-center">
              ↑ 0.8% from last month
            </app-badge>
          </div>
        </app-card>

        <!-- New Hires -->
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">New Hires (Month)</p>
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {{ newHires() | number }}
            </p>
            <app-badge variant="info" class="mt-3 justify-center">
              ↑ 12% from last month
            </app-badge>
          </div>
        </app-card>

        <!-- Departures -->
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Departures (Month)</p>
            <p class="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
              {{ departures() | number }}
            </p>
            <app-badge variant="error" class="mt-3 justify-center">
              ↑ 5% from last month
            </app-badge>
          </div>
        </app-card>
      </div>

      <!-- Metrics by Region -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              Headcount by Region
            </h2>
            <app-badge variant="info">Bar Chart</app-badge>
          </div>
          <app-chart
            [chartConfig]="headcountByRegionChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Metrics by Department -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              Headcount by Department
            </h2>
            <app-badge variant="info">Bar Chart</app-badge>
          </div>
          <app-chart
            [chartConfig]="headcountByDepartmentChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Employment Status Distribution -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              Employment Status Distribution
            </h2>
            <app-badge variant="info">Pie Chart</app-badge>
          </div>
          <app-chart
            [chartConfig]="employmentStatusChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Historical Trend Data (12 Months) -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              Headcount Trend (12 Months)
            </h2>
            <app-badge variant="success">↑ 3.2% growth</app-badge>
          </div>
          <app-chart
            [chartConfig]="headcountTrendChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Drill-down Section -->
      <app-card>
        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            Drill-Down to Employee Records
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              (click)="drillDownByRegion('Middle East')"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Middle East Employees
            </button>
            <button
              (click)="drillDownByRegion('Europe')"
              class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              View Europe Employees
            </button>
            <button
              (click)="drillDownByStatus('Active')"
              class="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              View Active Employees
            </button>
          </div>
        </div>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkforceComponent implements OnInit {
  totalHeadcount = signal<number>(12000);
  activeEmployees = signal<number>(11850);
  onLeave = signal<number>(150);
  newHires = signal<number>(45);
  departures = signal<number>(28);

  headcountByRegionChart = signal<ChartConfig>({
    type: 'bar',
    title: 'Headcount by Region',
    data: {
      categories: ['Middle East', 'Europe'],
      values: [6500, 5500],
    },
    height: '400px',
  });

  headcountByDepartmentChart = signal<ChartConfig>({
    type: 'bar',
    title: 'Headcount by Department',
    data: {
      categories: [
        'Engineering',
        'Sales',
        'Marketing',
        'HR',
        'Finance',
        'Operations',
      ],
      values: [2400, 2100, 1800, 1200, 1500, 3000],
    },
    height: '400px',
  });

  employmentStatusChart = signal<ChartConfig>({
    type: 'pie',
    title: 'Employment Status Distribution',
    data: {
      values: [
        { value: 11850, name: 'Active' },
        { value: 100, name: 'On Leave' },
        { value: 50, name: 'Inactive' },
      ],
    },
    height: '400px',
  });

  headcountTrendChart = signal<ChartConfig>({
    type: 'line',
    title: 'Headcount Trend (Last 12 Months)',
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
      values: [11650, 11700, 11750, 11800, 11850, 11900, 11950, 12000, 12050, 12100, 12150, 12200],
    },
    height: '400px',
  });

  ngOnInit(): void {
    this.loadWorkforceData();
  }

  private loadWorkforceData(): void {
    // In a real application, this would fetch data from a service
    // For now, we're using signal defaults
  }

  onChartClick(event: { name: string; value: unknown }): void {
    console.log('Chart clicked:', event);
    // Handle drill-down based on chart click
  }

  drillDownByRegion(region: string): void {
    console.log('Drilling down to region:', region);
    // In a real application, this would navigate to employee records filtered by region
  }

  drillDownByStatus(status: string): void {
    console.log('Drilling down to status:', status);
    // In a real application, this would navigate to employee records filtered by status
  }
}
