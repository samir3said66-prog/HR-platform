import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../components/card/card.component';
import { ChartComponent, type ChartConfig } from '../../components/chart/chart.component';
import { BadgeComponent } from '../../components/badge/badge.component';

/**
 * Hiring Forecast Dashboard
 *
 * Displays 12-month hiring forecasts by department and role, with confidence levels,
 * influencing factors, parameter adjustment, and critical role identification.
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

@Component({
  selector: 'app-hiring-forecast',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ChartComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Hiring Forecast</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">
          Predict future hiring needs based on turnover, growth, and workforce trends
        </p>
      </div>

      <!-- Parameter Adjustment Section -->
      <app-card>
        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Forecast Parameters</h2>
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Growth Rate (%)
              </label>
              <input
                type="number"
                [(ngModel)]="growthRate"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Turnover Assumption (%)
              </label>
              <input
                type="number"
                [(ngModel)]="turnoverAssumption"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Planned Departures
              </label>
              <input
                type="number"
                [(ngModel)]="plannedDepartures"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                min="0"
                step="1"
              />
            </div>
            <div class="flex items-end">
              <button
                (click)="recalculateForecast()"
                class="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Recalculate
              </button>
            </div>
          </div>
        </div>
      </app-card>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Total Predicted Hires (12M)
            </p>
            <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">
              {{ totalPredictedHires() }}
            </p>
            <app-badge variant="info" class="mt-3 justify-center">
              Based on current parameters
            </app-badge>
          </div>
        </app-card>

        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Average Monthly Hires
            </p>
            <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {{ averageMonthlyHires() }}
            </p>
            <app-badge variant="success" class="mt-3 justify-center">
              Steady hiring pace
            </app-badge>
          </div>
        </app-card>

        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Critical Roles at Risk
            </p>
            <p class="text-3xl font-bold text-red-600 dark:text-red-400 mt-2">
              {{ criticalRolesAtRisk() }}
            </p>
            <app-badge variant="error" class="mt-3 justify-center"> Requires attention </app-badge>
          </div>
        </app-card>

        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">
              Average Confidence Level
            </p>
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {{ averageConfidenceLevel() }}%
            </p>
            <app-badge variant="info" class="mt-3 justify-center">
              High confidence forecast
            </app-badge>
          </div>
        </app-card>
      </div>

      <!-- 12-Month Hiring Forecast by Department -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              12-Month Hiring Forecast by Department
            </h2>
            <app-badge variant="info">Bar Chart</app-badge>
          </div>
          <app-chart
            [chartConfig]="hiringForecastByDepartmentChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Hiring Forecast by Role -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              12-Month Hiring Forecast by Role
            </h2>
            <app-badge variant="info">Bar Chart</app-badge>
          </div>
          <app-chart
            [chartConfig]="hiringForecastByRoleChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Monthly Hiring Trend -->
      <app-card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
              Monthly Hiring Trend (12 Months)
            </h2>
            <app-badge variant="info">Line Chart</app-badge>
          </div>
          <app-chart
            [chartConfig]="monthlyHiringTrendChart()"
            (chartClick)="onChartClick($event)"
          ></app-chart>
        </div>
      </app-card>

      <!-- Confidence Levels by Department -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <app-card>
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
              Engineering Department
            </h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Predicted Hires</span>
                <span class="font-semibold text-slate-900 dark:text-white">145</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Confidence</span>
                <app-badge variant="success">High (94%)</app-badge>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Key Factors</span>
                <span class="text-xs text-slate-600 dark:text-slate-400">Growth, Turnover</span>
              </div>
            </div>
          </div>
        </app-card>

        <app-card>
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Sales Department</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Predicted Hires</span>
                <span class="font-semibold text-slate-900 dark:text-white">98</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Confidence</span>
                <app-badge variant="warning">Medium (82%)</app-badge>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Key Factors</span>
                <span class="text-xs text-slate-600 dark:text-slate-400">Seasonal, Turnover</span>
              </div>
            </div>
          </div>
        </app-card>

        <app-card>
          <div class="space-y-3">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">HR Department</h3>
            <div class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Predicted Hires</span>
                <span class="font-semibold text-slate-900 dark:text-white">32</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Confidence</span>
                <app-badge variant="success">High (91%)</app-badge>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-slate-600 dark:text-slate-400">Key Factors</span>
                <span class="text-xs text-slate-600 dark:text-slate-400">Growth, Planned</span>
              </div>
            </div>
          </div>
        </app-card>
      </div>

      <!-- Critical Roles with High Turnover Risk -->
      <app-card>
        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            Critical Roles with High Turnover Risk
          </h2>
          <div class="space-y-3">
            <div
              class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg"
            >
              <div>
                <p class="font-semibold text-slate-900 dark:text-white">Senior Developer</p>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                  Turnover Risk: 8.5% | Predicted Hires: 28
                </p>
              </div>
              <app-badge variant="error">High Risk</app-badge>
            </div>

            <div
              class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
            >
              <div>
                <p class="font-semibold text-slate-900 dark:text-white">Sales Manager</p>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                  Turnover Risk: 6.2% | Predicted Hires: 15
                </p>
              </div>
              <app-badge variant="warning">Medium Risk</app-badge>
            </div>

            <div
              class="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg"
            >
              <div>
                <p class="font-semibold text-slate-900 dark:text-white">Product Manager</p>
                <p class="text-sm text-slate-600 dark:text-slate-400">
                  Turnover Risk: 5.8% | Predicted Hires: 12
                </p>
              </div>
              <app-badge variant="warning">Medium Risk</app-badge>
            </div>
          </div>
        </div>
      </app-card>

      <!-- Influencing Factors -->
      <app-card>
        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            Key Influencing Factors
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p class="font-semibold text-slate-900 dark:text-white">Historical Turnover</p>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Average 2.3% monthly turnover based on 24-month history
              </p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p class="font-semibold text-slate-900 dark:text-white">Growth Projections</p>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Expected 5% organizational growth over next 12 months
              </p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p class="font-semibold text-slate-900 dark:text-white">Planned Departures</p>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {{ plannedDepartures }} planned departures identified
              </p>
            </div>
            <div class="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <p class="font-semibold text-slate-900 dark:text-white">Seasonal Patterns</p>
              <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Higher turnover in Q2 and Q4 based on historical data
              </p>
            </div>
          </div>
        </div>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HiringForecastComponent implements OnInit {
  growthRate = 5.0;
  turnoverAssumption = 2.3;
  plannedDepartures = 45;

  totalPredictedHires = signal<number>(275);
  averageMonthlyHires = signal<number>(23);
  criticalRolesAtRisk = signal<number>(12);
  averageConfidenceLevel = signal<number>(89);

  hiringForecastByDepartmentChart = signal<ChartConfig>({
    type: 'bar',
    title: '12-Month Hiring Forecast by Department',
    data: {
      categories: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'],
      values: [145, 98, 65, 32, 48, 87],
    },
    height: '400px',
  });

  hiringForecastByRoleChart = signal<ChartConfig>({
    type: 'bar',
    title: '12-Month Hiring Forecast by Role',
    data: {
      categories: [
        'Senior Developer',
        'Developer',
        'Sales Manager',
        'Sales Rep',
        'Product Manager',
        'Analyst',
      ],
      values: [28, 85, 15, 65, 12, 70],
    },
    height: '400px',
  });

  monthlyHiringTrendChart = signal<ChartConfig>({
    type: 'line',
    title: 'Monthly Hiring Trend (12 Months)',
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
      values: [18, 20, 22, 25, 28, 32, 30, 28, 25, 22, 20, 18],
    },
    height: '400px',
  });

  ngOnInit(): void {
    this.loadHiringForecastData();
  }

  private loadHiringForecastData(): void {
    // In a real application, this would fetch data from a service
    // Analyze historical turnover, planned departures, and growth projections
  }

  recalculateForecast(): void {
    console.log('Recalculating forecast with parameters:', {
      growthRate: this.growthRate,
      turnoverAssumption: this.turnoverAssumption,
      plannedDepartures: this.plannedDepartures,
    });
    // In a real application, this would call a service to recalculate the forecast
    // Update the charts and metrics based on new parameters
  }

  onChartClick(event: { name: string; value: unknown }): void {
    console.log('Chart clicked:', event);
    // Handle drill-down based on chart click
  }
}
