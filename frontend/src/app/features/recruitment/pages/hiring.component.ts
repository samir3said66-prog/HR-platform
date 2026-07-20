import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Hiring/Recruitment Page Component
 * Manages job postings, applications, and hiring pipeline
 */
@Component({
  selector: 'app-hiring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-4">Hiring & Recruitment</h1>
      <p class="text-slate-600">Recruitment and hiring pipeline management module</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HiringComponent {}
