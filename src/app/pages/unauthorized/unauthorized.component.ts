import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Unauthorized Page Component
 *
 * Displayed when user lacks required permissions to access a resource.
 *
 * Requirements: 30.4
 */
@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800"
    >
      <div class="text-center">
        <h1 class="text-6xl font-bold text-indigo-600 mb-4">403</h1>
        <h2 class="text-3xl font-bold text-white mb-2">Access Denied</h2>
        <p class="text-slate-400 mb-8">You do not have permission to access this resource.</p>
        <a
          routerLink="/"
          class="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Return to Dashboard
        </a>
      </div>
    </div>
  `,
})
export class UnauthorizedComponent {}
