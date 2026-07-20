import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Toggle Component
 *
 * A reusable toggle/switch component with on/off states.
 * Includes proper ARIA attributes and keyboard navigation.
 *
 * Requirements: 2.3, 8.2, 8.3, 14.1, 14.2
 */
@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle.component.html',
})
export class ToggleComponent {
  @Input() id = 'toggle-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string | null = null;
  @Input() ariaLabel: string | null = null;
  @Input() disabled = false;
  @Input() initialState = false;
  @Output() stateChange = new EventEmitter<boolean>();

  isOn = signal(this.initialState);

  toggle() {
    if (!this.disabled) {
      this.isOn.set(!this.isOn());
      this.stateChange.emit(this.isOn());
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggle();
    }
  }

  getToggleClasses(): string {
    return `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed ${
      this.isOn() ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
    }`;
  }
}
