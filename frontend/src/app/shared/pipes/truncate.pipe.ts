import { Pipe, PipeTransform } from '@angular/core';

/**
 * Truncate Pipe
 * Truncates text to a specified length
 */
@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number = 50, ellipsis: string = '...'): string {
    if (!value) return '';
    return value.length > limit ? value.substring(0, limit) + ellipsis : value;
  }
}
