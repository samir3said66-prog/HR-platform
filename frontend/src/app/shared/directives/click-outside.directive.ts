import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

/**
 * Click Outside Directive
 * Emits event when user clicks outside the element
 * Usage: (clickOutside)="onClickOutside()"
 */
@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const element = event.target as HTMLElement;
    if (!element) {
      this.clickOutside.emit();
    }
  }
}
