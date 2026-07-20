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
  templateUrl: './tabs.component.html',
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
