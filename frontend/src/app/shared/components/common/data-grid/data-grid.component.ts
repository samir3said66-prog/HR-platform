import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-data-grid',
  standalone: true,
  templateUrl: './data-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGridComponent {
  @Input() data: any[] = [];
}
