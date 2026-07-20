import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Unit Tests: ThemeService
 * Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 28.1
 */
describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    TestBed.configureTestingModule({ providers: [ThemeService] });
    service = TestBed.inject(ThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should default to light theme when nothing stored', () => {
    expect(service.getTheme()).toBe('light');
    expect(service.isDarkMode()).toBe(false);
  });

  it('should restore theme from localStorage', () => {
    localStorage.setItem('app-theme', 'dark');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [ThemeService] });
    const newService = TestBed.inject(ThemeService);
    expect(newService.getTheme()).toBe('dark');
  });

  it('should set theme to dark', () => {
    service.setTheme('dark');
    expect(service.getTheme()).toBe('dark');
    expect(service.isDark()).toBe(true);
    expect(service.isLight()).toBe(false);
  });

  it('should set theme to light', () => {
    service.setTheme('dark');
    service.setTheme('light');
    expect(service.getTheme()).toBe('light');
    expect(service.isDark()).toBe(false);
    expect(service.isLight()).toBe(true);
  });

  it('should toggle between dark and light', () => {
    service.setTheme('light');
    service.toggleTheme();
    expect(service.getTheme()).toBe('dark');
    service.toggleTheme();
    expect(service.getTheme()).toBe('light');
  });

  it('should add "dark" class to document root on dark mode', () => {
    service.setTheme('dark');
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should remove "dark" class from document root on light mode', () => {
    service.setTheme('dark');
    service.setTheme('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should persist theme to localStorage on change', () => {
    service.setTheme('dark');
    TestBed.flushEffects();
    expect(localStorage.getItem('app-theme')).toBe('dark');
    service.setTheme('light');
    TestBed.flushEffects();
    expect(localStorage.getItem('app-theme')).toBe('light');
  });

  it('should update isDarkMode signal on theme change', () => {
    service.setTheme('light');
    TestBed.flushEffects();
    expect(service.isDarkMode()).toBe(false);
    service.setTheme('dark');
    TestBed.flushEffects();
    expect(service.isDarkMode()).toBe(true);
  });
});
