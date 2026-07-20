import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-6"><h1>Employee Detail</h1></div>`,
})
export class EmployeeDetailComponent {}
