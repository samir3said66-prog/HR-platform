import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-widget">
      <h4>{{ title }}</h4>
      <div class="progress-bar">
        <div class="progress-fill" [style.width.%]="value"></div>
      </div>
      <p class="progress-label">{{ value }}%</p>
    </div>
  `,
  styles: [`
    .progress-widget { padding: 1rem; }
    h4 { margin: 0 0 0.5rem 0; }
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #3b82f6;
      transition: width 0.3s ease;
    }
    .progress-label {
      margin: 0.5rem 0 0 0;
      font-size: 0.875rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressWidgetComponent {
  @Input() title = '';
  @Input() value = 0;
}
