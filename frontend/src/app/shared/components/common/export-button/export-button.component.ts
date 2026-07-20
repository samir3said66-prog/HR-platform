import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-export-button',
  standalone: true,
  templateUrl: './export-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExportButtonComponent {
  @Input() format: 'csv' | 'excel' | 'pdf' = 'csv';
  @Output() export = new EventEmitter<string>();

  onExport(): void {
    this.export.emit(this.format);
  }
}
