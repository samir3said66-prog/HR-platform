import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardComponent, KPICardComponent, BadgeComponent } from '../../components';
import { DashboardMetrics } from '../../store/dashboard/dashboard.state';
import { selectDashboardMetrics } from '../../store/dashboard/dashboard.selectors';
import { AppState } from '../../store/app.state';
import { loadDashboardMetrics, updateDashboardMetricsRealtime } from '../../store/dashboard/dashboard.actions';
import { WebSocketService } from '../../services/websocket.service';

/**
 * Dashboard Page Component
 *
 * Main dashboard page displaying KPI cards and key metrics with real-time updates.
 *
 * Requirements: 1.1, 2.1, 3.1, 17.1
 */

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CardComponent,
    KPICardComponent,
    BadgeComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- KPI Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Headcount KPI -->
        <app-kpi-card
          [data]="{
            label: 'Total Headcount',
            value: metrics()?.totalHeadcount || 0,
            previousValue: 11700,
            trend: 'up',
            trendPercentage: 2.5,
            loading: metricsLoading()
          }"
        ></app-kpi-card>

        <!-- Active Employees KPI -->
        <app-kpi-card
          [data]="{
            label: 'Active Employees',
            value: metrics()?.activeEmployees || 0,
            previousValue: 11700,
            trend: 'up',
            trendPercentage: 1.2,
            loading: metricsLoading()
          }"
        ></app-kpi-card>

        <!-- On Leave KPI -->
        <app-kpi-card
          [data]="{
            label: 'On Leave',
            value: metrics()?.onLeave || 0,
            previousValue: 148,
            trend: 'up',
            trendPercentage: 0.8,
            loading: metricsLoading()
          }"
        ></app-kpi-card>

        <!-- New Hires KPI -->
        <app-kpi-card
          [data]="{
            label: 'New Hires (This Month)',
            value: metrics()?.newHires || 0,
            previousValue: 40,
            trend: 'up',
            trendPercentage: 12,
            loading: metricsLoading()
          }"
        ></app-kpi-card>
      </div>

      <!-- Welcome Message -->
      <app-card>
        <div class="text-center py-8">
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome to HR Analytics Platform
          </h2>
          <p class="text-slate-600 dark:text-slate-400">
            This is your central hub for workforce analytics, performance tracking, and strategic HR
            insights. All metrics update in real-time as data changes.
          </p>
        </div>
      </app-card>

      <!-- Quick Stats -->
      <app-card>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Departures (This Month)</p>
            <p class="text-2xl font-bold text-red-600 dark:text-red-400">{{ metrics()?.departures || 0 }}</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Last Updated</p>
            <p class="text-sm text-slate-700 dark:text-slate-300">{{ formatLastUpdated(metrics()?.lastUpdated) }}</p>
          </div>
          <div class="text-center">
            <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Data Freshness</p>
            <app-badge variant="success">Real-time</app-badge>
          </div>
        </div>
      </app-card>
    </div>
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private store: Store<AppState>;

  private wsService: WebSocketService;

  // Signals for reactive state
  metrics = signal<DashboardMetrics | null>(null);
  metricsLoading = signal(false);

  constructor(store: Store<AppState>, wsService: WebSocketService) {
    this.store = store;
    this.wsService = wsService;
  }

  ngOnInit(): void {
    // Load initial metrics
    this.store.dispatch(loadDashboardMetrics());

    // Subscribe to metrics from store
    this.store
      .select(selectDashboardMetrics)
      .pipe(takeUntil(this.destroy$))
      .subscribe((metrics) => {
        if (metrics) {
          this.metrics.set(metrics);
        }
      });

    // Subscribe to real-time web socket updates
    this.wsService.subscribe<DashboardMetrics>('DASHBOARD_METRICS_UPDATE')
      .pipe(takeUntil(this.destroy$))
      .subscribe((realtimeMetrics) => {
        this.store.dispatch(updateDashboardMetricsRealtime({ metrics: realtimeMetrics }));
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  formatLastUpdated(timestamp?: string): string {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }
}
