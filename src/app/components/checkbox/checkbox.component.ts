import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type CheckboxState = 'checked' | 'unchecked' | 'indeterminate';

/**
 * Checkbox Component
 *
 * A reusable checkbox component with support for checked, unchecked, and indeterminate states.
 * Includes proper ARIA attributes and keyboard navigation.
 *
 * Requirements: 2.3, 8.2, 8.3, 14.1, 14.2
 */
@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center">
      <input
        type="checkbox"
        [id]="id"
        [checked]="state() === 'checked'"
        [indeterminate]="state() === 'indeterminate'"
        [disabled]="disabled"
        (change)="onChange($event)"
        (keydown)="onKeydown($event)"
        [attr.aria-label]="ariaLabel || label"
        [attr.aria-checked]="state() === 'indeterminate' ? 'mixed' : state() === 'checked'"
        [attr.aria-disabled]="disabled"
        class="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      />
      <label
        *ngIf="label"
        [for]="id"
        class="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
      >
        {{ label }}
      </label>
    </div>
  `,
})
export class CheckboxComponent {
  @Input() id = 'checkbox-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string | null = null;
  @Input() ariaLabel: string | null = null;
  @Input() disabled = false;
  @Input() initialState: CheckboxState = 'unchecked';
  @Output() stateChange = new EventEmitter<CheckboxState>();
  @Output() checkedChange = new EventEmitter<boolean>();

  state = signal<CheckboxState>(this.initialState);

  onChange(event: Event) {
    const target = event.target as HTMLInputElement;

    // Cycle through states: unchecked -> checked -> indeterminate -> unchecked
    let newState: CheckboxState;
    if (this.state() === 'unchecked') {
      newState = 'checked';
    } else if (this.state() === 'checked') {
      newState = 'indeterminate';
    } else {
      newState = 'unchecked';
    }

    this.state.set(newState);
    this.stateChange.emit(newState);
    this.checkedChange.emit(newState === 'checked');
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === ' ') {
      event.preventDefault();
      const input = event.target as HTMLInputElement;
      input.click();
    }
  }
}
