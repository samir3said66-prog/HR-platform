import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Activity Feed</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityFeedComponent {
  @Input() activities: any[] = [];
}
