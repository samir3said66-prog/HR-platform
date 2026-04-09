import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../components/card/card.component';
import { BadgeComponent } from '../../components/badge/badge.component';

/**
 * Dashboard Page Component
 * 
 * Main dashboard page displaying KPI cards and key metrics.
 * 
 * Requirements: 1.1, 2.1, 3.1, 17.1
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent],
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Headcount KPI -->
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Total Headcount</p>
            <p class="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mt-2">12,000</p>
            <app-badge variant="success" class="mt-3 justify-center">
              ↑ 2.5% from last month
            </app-badge>
          </div>
        </app-card>

        <!-- Active Employees KPI -->
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Active Employees</p>
            <p class="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">11,850</p>
            <app-badge variant="success" class="mt-3 justify-center">
              ↑ 1.2% from last month
            </app-badge>
          </div>
        </app-card>

        <!-- On Leave KPI -->
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">On Leave</p>
            <p class="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">150</p>
            <app-badge variant="warning" class="mt-3 justify-center">
              ↑ 0.8% from last month
            </app-badge>
          </div>
        </app-card>

        <!-- New Hires KPI -->
        <app-card>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400">New Hires (This Month)</p>
            <p class="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">45</p>
            <app-badge variant="info" class="mt-3 justify-center">
              ↑ 12% from last month
            </app-badge>
          </div>
        </app-card>
      </div>

      <!-- Welcome Message -->
      <app-card>
        <div class="text-center py-8">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome to HR Analytics Platform</h2>
          <p class="text-slate-600 dark:text-slate-400">
            This is your central hub for workforce analytics, performance tracking, and strategic HR insights.
          </p>
        </div>
      </app-card>
    </div>
  `,
})
export class DashboardComponent {}
