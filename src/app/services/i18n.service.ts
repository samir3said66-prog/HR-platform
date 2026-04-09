import { Injectable, signal, effect } from '@angular/core';

type Language = 'en' | 'ar';

/**
 * Internationalization Service
 *
 * Manages language switching between English and Arabic.
 * Persists language preference to local storage.
 * Handles RTL layout switching for Arabic.
 *
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */
@Injectable({
  providedIn: 'root',
})
export class I18nService {
  private readonly LANGUAGE_KEY = 'app-language';
  private readonly DEFAULT_LANGUAGE: Language = 'en';

  language = signal<Language>(this.getStoredLanguage());
  isRTL = signal<boolean>(this.language() === 'ar');

  constructor() {
    // Update RTL when language changes
    effect(() => {
      const lang = this.language();
      this.isRTL.set(lang === 'ar');
      this.applyLanguageToDOM(lang);
      this.persistLanguage(lang);
    });
  }

  private getStoredLanguage(): Language {
    const stored = localStorage.getItem(this.LANGUAGE_KEY);
    return (stored as Language) || this.DEFAULT_LANGUAGE;
  }

  private persistLanguage(language: Language): void {
    localStorage.setItem(this.LANGUAGE_KEY, language);
  }

  private applyLanguageToDOM(language: Language): void {
    const htmlElement = document.documentElement;
    htmlElement.lang = language;
    htmlElement.dir = language === 'ar' ? 'rtl' : 'ltr';

    if (language === 'ar') {
      htmlElement.classList.add('rtl');
      htmlElement.classList.remove('ltr');
    } else {
      htmlElement.classList.add('ltr');
      htmlElement.classList.remove('rtl');
    }
  }

  setLanguage(language: Language): void {
    this.language.set(language);
  }

  getLanguage(): Language {
    return this.language();
  }

  isArabic(): boolean {
    return this.language() === 'ar';
  }

  isEnglish(): boolean {
    return this.language() === 'en';
  }

  // Translation dictionary
  private translations: Record<Language, Record<string, string>> = {
    en: {
      'app.title': 'HR Analytics Platform',
      'app.dashboard': 'Dashboard',
      'app.employees': 'Employees',
      'app.performance': 'Performance',
      'app.reports': 'Reports',
      'app.settings': 'Settings',
      'common.save': 'Save',
      'common.cancel': 'Cancel',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.filter': 'Filter',
      'common.loading': 'Loading...',
      'common.error': 'An error occurred',
      'common.success': 'Success',
    },
    ar: {
      'app.title': 'منصة تحليلات الموارد البشرية',
      'app.dashboard': 'لوحة التحكم',
      'app.employees': 'الموظفون',
      'app.performance': 'الأداء',
      'app.reports': 'التقارير',
      'app.settings': 'الإعدادات',
      'common.save': 'حفظ',
      'common.cancel': 'إلغاء',
      'common.delete': 'حذف',
      'common.edit': 'تعديل',
      'common.add': 'إضافة',
      'common.search': 'بحث',
      'common.filter': 'تصفية',
      'common.loading': 'جاري التحميل...',
      'common.error': 'حدث خطأ',
      'common.success': 'نجح',
    },
  };

  translate(key: string): string {
    const lang = this.language();
    return this.translations[lang][key] || key;
  }
}
