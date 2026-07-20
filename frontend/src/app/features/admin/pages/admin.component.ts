import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Admin Panel Component
 * System administration and configuration
 */
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-4">Admin Panel</h1>
      <p class="text-slate-600">System administration and configuration module</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {}
