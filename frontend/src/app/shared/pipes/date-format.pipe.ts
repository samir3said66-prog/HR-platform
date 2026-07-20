import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

/**
 * Date Format Pipe
 * Formats dates with i18n support
 */
@Pipe({
  name: 'dateFormat',
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: Date | string, format: string = 'short', timezone?: string, locale?: string): string | null {
    return this.datePipe.transform(value, format, timezone, locale);
  }
}
