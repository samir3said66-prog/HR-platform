import { Directive, ElementRef, Input, OnChanges, SimpleChanges, inject } from '@angular/core';

/**
 * Highlight Text Directive
 * Highlights specified text within an element
 * Usage: [appHighlightText]="searchTerm"
 */
@Directive({
  selector: '[appHighlightText]',
  standalone: true,
})
export class HighlightTextDirective implements OnChanges {
  private el = inject(ElementRef);
  private searchTerm = '';

  @Input() set appHighlightText(term: string) {
    this.searchTerm = term;
    this.highlight();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appHighlightText']) {
      this.highlight();
    }
  }

  private highlight(): void {
    if (!this.searchTerm) {
      this.el.nativeElement.innerHTML = this.el.nativeElement.innerText;
      return;
    }

    const regex = new RegExp(this.searchTerm, 'gi');
    const highlighted = this.el.nativeElement.innerText.replace(
      regex,
      (match: string) => `<mark>${match}</mark>`
    );
    this.el.nativeElement.innerHTML = highlighted;
  }
}
