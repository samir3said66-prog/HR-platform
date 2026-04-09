import {
  Component,
  Input,
  Output,
  EventEmitter,
  signal,
  ContentChildren,
  QueryList,
  AfterContentInit,
  Directive,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Tab Panel Directive
 *
 * Marks a content section as a tab panel.
 */
@Directive({
  selector: '[appTabPanel]',
  standalone: true,
})
export class TabPanelDirective {
  @Input() appTabPanel: string = '';
}

/**
 * Tabs Component
 *
 * A reusable tabs component with keyboard navigation and accessibility.
 * Supports multiple tabs with content panels and smooth transitions.
 *
 * Requirements: 8.2, 8.3, 8.4
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full">
      <!-- Tab List -->
      <div
        role="tablist"
        class="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto"
        (keydown)="onTabListKeyDown($event)"
      >
        <button
          *ngFor="let tab of tabs; let i = index"
          (click)="selectTab(i)"
          (keydown.arrowRight)="selectNextTab()"
          (keydown.arrowLeft)="selectPreviousTab()"
          (keydown.home)="selectTab(0)"
          (keydown.end)="selectTab(tabs.length - 1)"
          [attr.role]="'tab'"
          [attr.aria-selected]="activeTabIndex() === i"
          [attr.aria-controls]="'panel-' + i"
          [attr.tabindex]="activeTabIndex() === i ? 0 : -1"
          [disabled]="tab.disabled"
          [class.border-b-2]="activeTabIndex() === i"
          [class.border-indigo-600]="activeTabIndex() === i"
          [class.text-indigo-600]="activeTabIndex() === i"
          [class.dark:border-indigo-500]="activeTabIndex() === i"
          [class.dark:text-indigo-400]="activeTabIndex() === i"
          [class.text-slate-600]="activeTabIndex() !== i"
          [class.dark:text-slate-400]="activeTabIndex() !== i"
          [class.opacity-50]="tab.disabled"
          [class.cursor-not-allowed]="tab.disabled"
          class="px-4 py-3 font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 whitespace-nowrap"
          type="button"
        >
          {{ tab.label }}
          <span *ngIf="tab.badge" class="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full">
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <!-- Tab Panels -->
      <div class="mt-4">
        <div
          *ngFor="let tab of tabs; let i = index"
          [id]="'panel-' + i"
          [attr.role]="'tabpanel'"
          [attr.aria-labelledby]="'tab-' + i"
          [hidden]="activeTabIndex() !== i"
          class="animate-in fade-in duration-200"
        >
          <ng-container *ngIf="activeTabIndex() === i">
            <ng-content></ng-content>
          </ng-container>
        </div>
      </div>
    </div>
  `,
})
export class TabsComponent implements AfterContentInit {
  @Input() tabs: Tab[] = [];
  @Input() activeIndex = 0;
  @Output() onTabChange = new EventEmitter<number>();

  @ContentChildren(TabPanelDirective) tabPanels!: QueryList<TabPanelDirective>;

  activeTabIndex = signal(0);

  ngAfterContentInit(): void {
    this.activeTabIndex.set(this.activeIndex);
  }

  selectTab(index: number): void {
    if (index >= 0 && index < this.tabs.length && !this.tabs[index].disabled) {
      this.activeTabIndex.set(index);
      this.onTabChange.emit(index);
    }
  }

  selectNextTab(): void {
    let nextIndex = this.activeTabIndex() + 1;
    while (nextIndex < this.tabs.length && this.tabs[nextIndex].disabled) {
      nextIndex++;
    }
    if (nextIndex < this.tabs.length) {
      this.selectTab(nextIndex);
    }
  }

  selectPreviousTab(): void {
    let prevIndex = this.activeTabIndex() - 1;
    while (prevIndex >= 0 && this.tabs[prevIndex].disabled) {
      prevIndex--;
    }
    if (prevIndex >= 0) {
      this.selectTab(prevIndex);
    }
  }

  onTabListKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        this.selectNextTab();
        break;

      case 'ArrowLeft':
        event.preventDefault();
        this.selectPreviousTab();
        break;

      case 'Home':
        event.preventDefault();
        this.selectTab(0);
        break;

      case 'End':
        event.preventDefault();
        this.selectTab(this.tabs.length - 1);
        break;
    }
  }
}

export interface Tab {
  id: string;
  label: string;
  badge?: string;
  disabled?: boolean;
}
