import { Directive, ElementRef, Input, AfterViewInit, inject } from '@angular/core';

/**
 * Auto Focus Directive
 * Automatically focuses input element on load
 * Usage: [appAutoFocus]="shouldFocus"
 */
@Directive({
  selector: '[appAutoFocus]',
  standalone: true,
})
export class AutoFocusDirective implements AfterViewInit {
  private el = inject(ElementRef);
  private shouldFocus = true;

  @Input() set appAutoFocus(focus: boolean) {
    this.shouldFocus = focus;
  }

  ngAfterViewInit(): void {
    if (this.shouldFocus && this.el.nativeElement.focus) {
      this.el.nativeElement.focus();
    }
  }
}
