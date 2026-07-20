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
  templateUrl: './icon.component.html',
})
export class IconComponent {
  @Input() name: string | null = null;
  @Input() size = '5';
  @Input() filled = false;
  @Input() label = '';
}
