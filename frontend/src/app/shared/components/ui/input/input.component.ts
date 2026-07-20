import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Input Component
 *
 * A reusable input component with validation states and error messages.
 * Implements ControlValueAccessor for reactive forms integration.
 *
 * Requirements: 2.3, 8.2, 8.5, 14.1
 */
@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() id = `input-${Math.random().toString(36).substr(2, 9)}`;
  @Input() type = 'text';
  @Input() label: string | null = null;
  @Input() placeholder = '';
  @Input() disabled = false;
  @Input() required = false;
  @Input() error: string | null = null;
  @Input() ariaLabel: string | null = null;
  @Output() valueChange = new EventEmitter<string>();

  @Input() value = '';
  touched = false;
  errorId = `${this.id}-error`;

  get hasError(): boolean {
    return this.touched && !!this.error;
  }

  getInputClasses(): string {
    const baseClasses =
      'w-full px-3 py-2 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:bg-slate-100 disabled:cursor-not-allowed dark:bg-slate-700 dark:text-white dark:border-slate-600';

    const errorClasses = this.hasError
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500';

    return `${baseClasses} ${errorClasses}`;
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.valueChange.emit(this.value);
    this.onChange(this.value);
  }

  onBlur(): void {
    this.touched = true;
    this.onTouched();
  }

  // ControlValueAccessor implementation
  onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
