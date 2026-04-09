import { Component, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../components/card/card.component';
import { BadgeComponent } from '../../components/badge/badge.component';
import { ButtonComponent } from '../../components/button/button.component';
import { ReportService, type ReportConfig, type ReportMetric } from '../../services/report.service';

/**
 * Report Generation and Export Page
 *
 * Allows users to build custom reports, select metrics, date ranges, and filters,
 * then export in multiple formats (PDF, CSV, Excel) with multi-language support.
 *
 * Requirements: 24.1, 24.2, 24.3, 24.4, 26.1, 26.2
 */

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  metrics: ReportMetric[];
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardComponent,
    BadgeComponent,
    ButtonComponent,
  ],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Report Generation</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2">
          Create and export custom reports in multiple formats
        </p>
      </div>

      <!-- Report Builder -->
      <app-card>
        <div class="space-y-6">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Report Builder</h2>

          <!-- Report Template Selection -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Report Template
            </label>
            <select
              [(ngModel)]="selectedTemplate"
              (change)="onTemplateChange()"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="">-- Select a template --</option>
              <option *ngFor="let template of reportTemplates()" [value]="template.id">
                {{ template.name }}
              </option>
            </select>
          </div>

          <!-- Report Title -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Report Title
            </label>
            <input
              type="text"
              [(ngModel)]="reportTitle"
              placeholder="Enter report title"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

          <!-- Date Range -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                [(ngModel)]="startDate"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                [(ngModel)]="endDate"
                class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <!-- Filters -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Filters
            </label>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Department
                </label>
                <select
                  [(ngModel)]="selectedDepartment"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Region
                </label>
                <select
                  [(ngModel)]="selectedRegion"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">All Regions</option>
                  <option value="Middle East">Middle East</option>
                  <option value="Europe">Europe</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Employment Status
                </label>
                <select
                  [(ngModel)]="selectedStatus"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Language Selection -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Export Language
            </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  [(ngModel)]="selectedLanguage"
                  value="en"
                  class="w-4 h-4"
                />
                <span class="text-sm text-slate-700 dark:text-slate-300">English</span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="radio"
                  [(ngModel)]="selectedLanguage"
                  value="ar"
                  class="w-4 h-4"
                />
                <span class="text-sm text-slate-700 dark:text-slate-300">العربية</span>
              </label>
            </div>
          </div>

          <!-- Export Buttons -->
          <div class="flex gap-4 pt-4">
            <button
              (click)="exportReport('pdf')"
              class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              📄 Export as PDF
            </button>
            <button
              (click)="exportReport('csv')"
              class="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              📊 Export as CSV
            </button>
            <button
              (click)="exportReport('excel')"
              class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              📈 Export as Excel
            </button>
          </div>
        </div>
      </app-card>

      <!-- Pre-built Report Templates -->
      <div>
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-4">
          Pre-built Report Templates
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <app-card *ngFor="let template of reportTemplates()">
            <div class="space-y-3">
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
                {{ template.name }}
              </h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">{{ template.description }}</p>
              <div class="flex gap-2 pt-2">
                <button
                  (click)="selectTemplate(template)"
                  class="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                >
                  Use Template
                </button>
              </div>
            </div>
          </app-card>
        </div>
      </div>

      <!-- Recent Reports -->
      <app-card>
        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">Recent Reports</h2>
          <div class="space-y-3">
            <div
              *ngFor="let report of recentReports()"
              class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
            >
              <div>
                <p class="font-semibold text-slate-900 dark:text-white">{{ report.name }}</p>
                <p class="text-sm text-slate-600 dark:text-slate-400">{{ report.date }}</p>
              </div>
              <app-badge [variant]="report.status === 'completed' ? 'success' : 'info'">
                {{ report.status }}
              </app-badge>
            </div>
          </div>
        </div>
      </app-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent implements OnInit {
  reportTitle = 'HR Analytics Report';
  startDate = '';
  endDate = '';
  selectedTemplate = '';
  selectedDepartment = '';
  selectedRegion = '';
  selectedStatus = '';
  selectedLanguage: 'en' | 'ar' = 'en';

  reportTemplates = signal<ReportTemplate[]>([
    {
      id: 'performance',
      name: 'Performance Analytics',
      description: 'Employee performance metrics, trends, and departmental comparisons',
      metrics: [
        { name: 'Average Performance Score', value: 79, unit: 'points' },
        { name: 'High Performers', value: 805, unit: 'employees' },
        { name: 'Needs Improvement', value: 165, unit: 'employees' },
        { name: 'Reviews Completed', value: 94, unit: '%' },
      ],
    },
    {
      id: 'workforce',
      name: 'Workforce Metrics',
      description: 'Headcount, active employees, new hires, and departures by region/department',
      metrics: [
        { name: 'Total Headcount', value: 12000, unit: 'employees' },
        { name: 'Active Employees', value: 11850, unit: 'employees' },
        { name: 'On Leave', value: 150, unit: 'employees' },
        { name: 'New Hires (Month)', value: 45, unit: 'employees' },
        { name: 'Departures (Month)', value: 28, unit: 'employees' },
      ],
    },
    {
      id: 'turnover',
      name: 'Turnover Analysis',
      description: 'Historical turnover rates, trends, and 6-month predictions',
      metrics: [
        { name: 'Current Turnover Rate', value: 2.3, unit: '%' },
        { name: 'Departures (This Month)', value: 28, unit: 'employees' },
        { name: 'Average Tenure', value: 5.2, unit: 'years' },
        { name: 'High Risk Roles', value: 12, unit: 'roles' },
      ],
    },
    {
      id: 'hiring',
      name: 'Hiring Forecast',
      description: '12-month hiring forecasts by department and role with confidence levels',
      metrics: [
        { name: 'Total Predicted Hires (12M)', value: 275, unit: 'employees' },
        { name: 'Average Monthly Hires', value: 23, unit: 'employees' },
        { name: 'Critical Roles at Risk', value: 12, unit: 'roles' },
        { name: 'Average Confidence Level', value: 89, unit: '%' },
      ],
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive HR Report',
      description: 'Complete overview of all HR metrics and analytics',
      metrics: [
        { name: 'Total Headcount', value: 12000, unit: 'employees' },
        { name: 'Average Performance Score', value: 79, unit: 'points' },
        { name: 'Turnover Rate', value: 2.3, unit: '%' },
        { name: 'Predicted Hires (12M)', value: 275, unit: 'employees' },
      ],
    },
    {
      id: 'executive',
      name: 'Executive Summary',
      description: 'High-level overview for leadership and executives',
      metrics: [
        { name: 'Total Headcount', value: 12000, unit: 'employees' },
        { name: 'Headcount Growth', value: 2.5, unit: '%' },
        { name: 'Turnover Rate', value: 2.3, unit: '%' },
        { name: 'Average Performance', value: 79, unit: 'points' },
      ],
    },
  ]);

  recentReports = signal([
    { name: 'Performance Analytics Report', date: '2024-01-15', status: 'completed' },
    { name: 'Workforce Metrics Report', date: '2024-01-14', status: 'completed' },
    { name: 'Turnover Analysis Report', date: '2024-01-13', status: 'completed' },
  ]);

  constructor(private reportService: ReportService) {}

  ngOnInit(): void {
    // Initialize with default date range (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    this.endDate = today.toISOString().split('T')[0];
    this.startDate = thirtyDaysAgo.toISOString().split('T')[0];
  }

  onTemplateChange(): void {
    const template = this.reportTemplates().find((t) => t.id === this.selectedTemplate);
    if (template) {
      this.reportTitle = template.name;
    }
  }

  selectTemplate(template: ReportTemplate): void {
    this.selectedTemplate = template.id;
    this.reportTitle = template.name;
  }

  exportReport(format: 'pdf' | 'csv' | 'excel'): void {
    if (!this.reportTitle || !this.startDate || !this.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const template = this.reportTemplates().find((t) => t.id === this.selectedTemplate);
    const metrics = template?.metrics || [];

    const filters: Record<string, unknown> = {};
    if (this.selectedDepartment) filters['Department'] = this.selectedDepartment;
    if (this.selectedRegion) filters['Region'] = this.selectedRegion;
    if (this.selectedStatus) filters['Status'] = this.selectedStatus;

    const config: ReportConfig = {
      title: this.reportTitle,
      metrics,
      dateRange: {
        startDate: new Date(this.startDate),
        endDate: new Date(this.endDate),
      },
      filters: Object.keys(filters).length > 0 ? filters : undefined,
      language: this.selectedLanguage,
    };

    this.reportService.generateReport(config, format);
  }
}
