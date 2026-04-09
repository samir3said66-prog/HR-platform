import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { signal } from '@angular/core';
import { ButtonComponent, ConnectionStatusComponent } from '../../components';
import { I18nService, ThemeService } from '../../services';

/**
 * Dashboard Layout Component
 * 
 * Main layout for the dashboard with:
 * - Responsive sidebar navigation
 * - Top navigation bar with user profile and settings
 * - Language and theme switchers
 * - Connection status indicator
 * 
 * Requirements: 3.1, 5.3, 9.1, 10.1
 */
@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ButtonComponent, ConnectionStatusComponent],
  template: `
    <div class="flex h-screen bg-slate-50 dark:bg-slate-900">
      <!-- Sidebar -->
      <aside class="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shadow-sm">
        <div class="p-6">
          <h1 class="text-2xl font-bold text-indigo-600 dark:text-indigo-400">HR Analytics</h1>
        </div>
        <nav class="mt-8 space-y-2 px-4">
          <a href="#" class="block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            {{ i18nService.translate('app.dashboard') }}
          </a>
          <a href="#" class="block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            {{ i18nService.translate('app.employees') }}
          </a>
          <a href="#" class="block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            {{ i18nService.translate('app.performance') }}
          </a>
          <a href="#" class="block px-4 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            {{ i18nService.translate('app.reports') }}
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top Navigation -->
        <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
          <div class="px-6 py-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">{{ pageTitle() }}</h2>
            <div class="flex items-center gap-4">
              <!-- Connection Status -->
              <app-connection-status></app-connection-status>

              <!-- Language Switcher -->
              <button
                (click)="toggleLanguage()"
                class="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                [attr.aria-label]="'Switch language to ' + (i18nService.isArabic() ? 'English' : 'Arabic')"
              >
                {{ i18nService.isArabic() ? 'EN' : 'AR' }}
              </button>

              <!-- Theme Switcher -->
              <button
                (click)="toggleTheme()"
                class="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                [attr.aria-label]="'Switch to ' + (themeService.isDark() ? 'light' : 'dark') + ' mode'"
              >
                {{ themeService.isDark() ? '☀️' : '🌙' }}
              </button>

              <!-- User Profile -->
              <div class="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700">
                <div class="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                  U
                </div>
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">User</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-auto">
          <div class="p-6">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class DashboardLayoutComponent implements OnInit {
  pageTitle = signal('Dashboard');

  constructor(
    public i18nService: I18nService,
    public themeService: ThemeService,
  ) {}

  ngOnInit(): void {
    // Initialize layout
  }

  toggleLanguage(): void {
    const currentLang = this.i18nService.getLanguage();
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    this.i18nService.setLanguage(newLang);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
