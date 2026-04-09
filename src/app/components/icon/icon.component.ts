import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Icon Component
 *
 * Reusable icon component for displaying SVG icons.
 *
 * Requirements: 8.2
 */

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [class]="'w-' + size + ' h-' + size + ' ' + (filled ? 'fill-current' : 'stroke-current')"
      [attr.aria-label]="label"
      [attr.role]="label ? 'img' : 'presentation'"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <ng-content></ng-content>
    </svg>
  `,
})
export class IconComponent {
  @Input() size = '5';
  @Input() filled = false;
  @Input() label = '';
}
