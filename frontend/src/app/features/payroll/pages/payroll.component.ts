import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Payroll Page Component
 * Manages payroll processing and salary disbursement
 */
@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-4">Payroll Management</h1>
      <p class="text-slate-600">Payroll processing and salary management module</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PayrollComponent {}
