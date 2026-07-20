import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-6"><h1>Not Found</h1></div>`,
})
export class NotFoundComponent {}
