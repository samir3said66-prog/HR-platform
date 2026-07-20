import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-chart-widget',
  standalone: true,
  template: `<div>Chart Widget</div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartWidgetComponent {
  @Input() data: any;
}
