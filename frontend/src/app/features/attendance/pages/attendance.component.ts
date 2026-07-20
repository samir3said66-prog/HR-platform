import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Attendance Page Component
 * Manages employee attendance tracking and records
 */
@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-4">Attendance Management</h1>
      <p class="text-slate-600">Attendance tracking and management module</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceComponent {}
