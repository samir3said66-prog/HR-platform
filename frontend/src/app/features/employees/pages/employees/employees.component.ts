import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-6"><h1>Employees</h1></div>`,
})
export class EmployeesComponent {}
