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
  templateUrl: './breadcrumb.component.html',
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
