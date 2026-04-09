import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

/**
 * Breadcrumb Navigation Component
 *
 * Displays navigation breadcrumbs for page hierarchy.
 *
 * Requirements: 2.1, 2.2
 */

export interface BreadcrumbItem {
  label: string;
  route?: string;
  active?: boolean;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <ol class="flex items-center gap-2">
        <li *ngFor="let item of items; let last = last">
          <a
            *ngIf="!last && item.route"
            [routerLink]="item.route"
            class="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            {{ item.label }}
          </a>
          <span *ngIf="last" class="text-slate-900 dark:text-white font-medium">
            {{ item.label }}
          </span>
          <span *ngIf="!last" class="text-slate-400 dark:text-slate-600 mx-1">/</span>
        </li>
      </ol>
    </nav>
  `,
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
