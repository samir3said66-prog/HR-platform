import { Injectable, signal, effect } from '@angular/core';

type Theme = 'light' | 'dark';

/**
 * Theme Service
 *
 * Manages dark mode and light mode themes.
 * Persists theme preference to local storage.
 * Applies theme to DOM using Tailwind CSS class strategy.
 *
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5
 */
@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private readonly DEFAULT_THEME: Theme = 'light';

  theme = signal<Theme>(this.getStoredTheme());
  isDarkMode = signal<boolean>(this.theme() === 'dark');

  constructor() {
    // Update dark mode when theme changes
    effect(() => {
      const currentTheme = this.theme();
      this.isDarkMode.set(currentTheme === 'dark');
      this.applyThemeToDOM(currentTheme);
      this.persistTheme(currentTheme);
    });
  }

  private getStoredTheme(): Theme {
    const stored = localStorage.getItem(this.THEME_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return this.DEFAULT_THEME;
  }

  private persistTheme(theme: Theme): void {
    localStorage.setItem(this.THEME_KEY, theme);
  }

  private applyThemeToDOM(theme: Theme): void {
    const htmlElement = document.documentElement;

    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  getTheme(): Theme {
    return this.theme();
  }

  toggleTheme(): void {
    const currentTheme = this.theme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  isDark(): boolean {
    return this.theme() === 'dark';
  }

  isLight(): boolean {
    return this.theme() === 'light';
  }
}
