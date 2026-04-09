import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface RadioOption {
  value: any;
  label: string;
  disabled?: boolean;
}

/**
 * Radio Component
 * 
 * A reusable radio button group component with proper ARIA attributes
 * and keyboard navigation support.
 * 
 * Requirements: 2.3, 8.2, 8.3, 14.1, 14.2
 */
@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <fieldset class="space-y-3">
      <legend *ngIf="label" class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
        {{ label }}
      </legend>
      
      <div role="radiogroup" [attr.aria-label]="ariaLabel || label" [attr.aria-disabled]="disabled">
        <div *ngFor="let option of options; let idx = index" class="flex items-center">
          <input
            type="radio"
            [id]="id + '-' + idx"
            [name]="id"
            [value]="option.value"
            [(ngModel)]="selectedValue"
            (change)="onSelectionChange(option.value)"
            (keydown)="onKeydown($event, idx)"
            [disabled]="disabled || (option.disabled ?? false)"
            [attr.aria-label]="option.label"
            [attr.aria-disabled]="disabled || (option.disabled ?? false)"
            class="w-4 h-4 border-slate-300 dark:border-slate-600 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          />
          <label
            [for]="id + '-' + idx"
            class="ml-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
            [class.opacity-50]="disabled || option.disabled"
            [class.cursor-not-allowed]="disabled || option.disabled"
          >
            {{ option.label }}
          </label>
        </div>
      </div>
    </fieldset>
  `,
})
export class RadioComponent {
  @Input() id = 'radio-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string | null = null;
  @Input() ariaLabel: string | null = null;
  @Input() options: RadioOption[] = [];
  @Input() disabled = false;
  @Input() initialValue: any = null;
  @Output() selectionChange = new EventEmitter<any>();

  selectedValue = signal<any>(this.initialValue);

  onSelectionChange(value: any) {
    this.selectedValue.set(value);
    this.selectionChange.emit(value);
  }

  onKeydown(event: KeyboardEvent, index: number) {
    const options = this.options.filter(o => !o.disabled && !this.disabled);
    if (options.length === 0) return;

    let newIndex = index;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        newIndex = (index + 1) % options.length;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        newIndex = (index - 1 + options.length) % options.length;
        break;
      default:
        return;
    }

    const nextOption = options[newIndex];
    if (nextOption) {
      this.onSelectionChange(nextOption.value);
      // Focus the next radio button
      setTimeout(() => {
        const nextInput = document.getElementById(this.id + '-' + this.options.indexOf(nextOption)) as HTMLInputElement;
        nextInput?.focus();
      });
    }
  }
}
