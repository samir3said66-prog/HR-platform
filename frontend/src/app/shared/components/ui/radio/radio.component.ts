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
  templateUrl: './radio.component.html',
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
    const options = this.options.filter((o) => !o.disabled && !this.disabled);
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
        const nextInput = document.getElementById(
          this.id + '-' + this.options.indexOf(nextOption),
        ) as HTMLInputElement;
        nextInput?.focus();
      });
    }
  }
}
