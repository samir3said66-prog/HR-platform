import { Pipe, PipeTransform } from '@angular/core';

/**
 * Currency Format Pipe
 * Formats numbers as currency
 */
@Pipe({
  name: 'currencyFormat',
  standalone: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number, currency: string = 'USD', decimals: number = 2): string {
    if (!value) return '';

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }
}
