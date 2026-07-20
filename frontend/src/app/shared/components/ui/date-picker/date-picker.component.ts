import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  computed,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * DatePicker Component
 *
 * A reusable date picker component with support for single date and date range selection.
 * Includes keyboard navigation and proper ARIA labels.
 *
 * Requirements: 2.3, 8.2, 8.3, 14.1, 14.2
 */
@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-picker.component.html',
})
export class DatePickerComponent implements OnInit {
  @Input() id = 'datepicker-' + Math.random().toString(36).substr(2, 9);
  @Input() label: string | null = null;
  @Input() ariaLabel: string | null = null;
  @Input() range = false;
  @Input() disabled = false;
  @Input() error: string | null = null;
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Output() dateChange = new EventEmitter<Date | [Date, Date]>();

  @ViewChild('calendar') calendar: ElementRef | null = null;

  isOpen = signal(false);
  selectedStartDate = signal<Date | null>(null);
  selectedEndDate = signal<Date | null>(null);
  currentMonth = signal(new Date());

  dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  ngOnInit() {
    this.currentMonth.set(new Date());
  }

  toggleCalendar(mode: 'start' | 'end' = 'start') {
    if (!this.disabled) {
      this.isOpen.set(!this.isOpen());
    }
  }

  selectDate(date: Date) {
    if (this.range) {
      const start = this.selectedStartDate();
      const end = this.selectedEndDate();

      if (!start) {
        this.selectedStartDate.set(date);
      } else if (!end) {
        if (date < start) {
          this.selectedStartDate.set(date);
          this.selectedEndDate.set(start);
        } else {
          this.selectedEndDate.set(date);
        }
        this.isOpen.set(false);
        this.dateChange.emit([this.selectedStartDate()!, this.selectedEndDate()!]);
      } else {
        this.selectedStartDate.set(date);
        this.selectedEndDate.set(null);
      }
    } else {
      this.selectedStartDate.set(date);
      this.isOpen.set(false);
      this.dateChange.emit(date);
    }
  }

  isDateSelected(date: Date): boolean {
    const start = this.selectedStartDate();
    const end = this.selectedEndDate();

    if (!start) return false;

    if (this.range && end) {
      return date >= start && date <= end;
    }

    return this.isSameDay(date, start);
  }

  previousMonth() {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() - 1));
  }

  nextMonth() {
    const current = this.currentMonth();
    this.currentMonth.set(new Date(current.getFullYear(), current.getMonth() + 1));
  }

  getMonthYearDisplay(): string {
    const current = this.currentMonth();
    return current.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  calendarDays = computed(() => {
    const current = this.currentMonth();
    const year = current.getFullYear();
    const month = current.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    let date = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = date.getMonth() === month;
      const isDisabled = this.isDateDisabled(date);

      days.push({
        date: new Date(date),
        isCurrentMonth,
        isDisabled,
      });

      date.setDate(date.getDate() + 1);
    }

    return days;
  });

  isDateDisabled(date: Date): boolean {
    if (this.minDate && date < this.minDate) return true;
    if (this.maxDate && date > this.maxDate) return true;
    return false;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  getDaysDifference(): number {
    const start = this.selectedStartDate();
    const end = this.selectedEndDate();

    if (!start || !end) return 0;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  handleInputKeydown(event: KeyboardEvent, mode: 'start' | 'end') {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleCalendar(mode);
    }
  }

  handleDayKeydown(event: KeyboardEvent, date: Date) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        this.selectDate(date);
        break;
      case 'Escape':
        event.preventDefault();
        this.isOpen.set(false);
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(`#${this.id}`) && !target.closest('[role="dialog"]')) {
      this.isOpen.set(false);
    }
  }

  getDayClasses(day: any): string {
    const isSelected = this.isDateSelected(day.date);
    const isStart = this.selectedStartDate() && this.isSameDay(day.date, this.selectedStartDate()!);
    const isEnd = this.selectedEndDate() && this.isSameDay(day.date, this.selectedEndDate()!);

    return `w-full py-2 text-sm rounded transition-colors ${
      !day.isCurrentMonth
        ? 'text-slate-300 dark:text-slate-600 cursor-default'
        : day.isDisabled
          ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
          : isStart || isEnd
            ? 'bg-indigo-600 text-white font-semibold'
            : isSelected
              ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100'
              : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100'
    }`;
  }

  getCalendarClasses(): string {
    return 'absolute top-full left-0 mt-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg z-50 w-80';
  }
}
