/**
 * Form Utilities
 * Helper functions for form operations
 */

import { FormGroup } from '@angular/forms';

export class FormUtil {
  static markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  static getFormErrors(formGroup: FormGroup): Record<string, any> {
    const errors: Record<string, any> = {};

    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });

    return errors;
  }

  static resetForm(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.get(key)?.markAsPristine();
      formGroup.get(key)?.markAsUntouched();
    });
  }
}
