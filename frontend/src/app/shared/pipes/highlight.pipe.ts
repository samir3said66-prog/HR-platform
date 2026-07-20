import { Pipe, PipeTransform } from '@angular/core';

/**
 * Highlight Pipe
 * Highlights a search term in text
 */
@Pipe({
  name: 'highlight',
  standalone: true,
})
export class HighlightPipe implements PipeTransform {
  transform(value: string, search: string, cssClass: string = 'highlight'): string {
    if (!search || !value) return value;

    const regex = new RegExp(search, 'gi');
    return value.replace(regex, (match) => `<mark class="${cssClass}">${match}</mark>`);
  }
}
