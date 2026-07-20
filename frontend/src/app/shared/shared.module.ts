/**
 * Shared Module
 *
 * Provides all shared exports including:
 * - UI Components (forms, displays, data, visualization)
 * - Common Components (data grid, export, pagination, etc.)
 * - Pipes (translation, formatting, filtering)
 * - Directives (permissions, loading, focus, click-outside)
 * - Widgets (KPI, stats, charts, progress)
 * - Utilities (table, form, export helpers)
 *
 * Can be imported in features or used directly with standalone components.
 *
 * Usage:
 * - NgModule approach: import { SharedModule } from '@app/shared';
 * - Standalone approach: import { ButtonComponent, InputComponent } from '@app/shared/components/ui';
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// ============================================
// UI Components (Form, Display, Data, etc.)
// ============================================

// Form Components
import { InputComponent } from './components/ui/input/input.component';
import { ButtonComponent } from './components/ui/button/button.component';
import { SelectComponent } from './components/ui/select/select.component';
import { CheckboxComponent } from './components/ui/checkbox/checkbox.component';
import { RadioComponent } from './components/ui/radio/radio.component';
import { ToggleComponent } from './components/ui/toggle/toggle.component';
import { DatePickerComponent } from './components/ui/date-picker/date-picker.component';

// Display Components
import { CardComponent } from './components/ui/card/card.component';
import { BadgeComponent } from './components/ui/badge/badge.component';
import { IconComponent } from './components/ui/icon/icon.component';
import { BreadcrumbComponent } from './components/ui/breadcrumb/breadcrumb.component';

// Complex Components
import { DropdownComponent } from './components/ui/dropdown/dropdown.component';
import { TabsComponent } from './components/ui/tabs/tabs.component';
import { AccordionComponent } from './components/ui/accordion/accordion.component';
import { ModalComponent } from './components/ui/modal/modal.component';

// Data Components
import { DataTableComponent } from './components/ui/data-table/data-table.component';
import { FilterPanelComponent } from './components/ui/filter-panel/filter-panel.component';
import { SearchInputComponent } from './components/ui/search-input/search-input.component';

// Visualization Components
import { ChartComponent } from './components/ui/chart/chart.component';
import { KPICardComponent } from './components/ui/kpi-card/kpi-card.component';

// Connection Components
import { ConnectionStatusComponent } from './components/ui/connection-status/connection-status.component';
import { NotificationCenterComponent } from './components/ui/notification-center/notification-center.component';

// ============================================
// Common Components
// ============================================

import { DataGridComponent } from './components/common/data-grid/data-grid.component';
import { ExportButtonComponent } from './components/common/export-button/export-button.component';
import { PaginationComponent } from './components/common/pagination/pagination.component';
import { EmptyStateComponent } from './components/common/empty-state/empty-state.component';
import { LoadingSkeletonComponent } from './components/common/loading-skeleton/loading-skeleton.component';
import { ToastComponent } from './components/common/toast/toast.component';
import { AlertComponent } from './components/common/alert/alert.component';
import { ConfirmDialogComponent } from './components/common/confirm-dialog/confirm-dialog.component';
import { BreadcrumbsComponent } from './components/common/breadcrumbs/breadcrumbs.component';

// ============================================
// Pipes
// ============================================

import {
  SafeHtmlPipe,
  CurrencyFormatPipe,
  DateFormatPipe,
  TruncatePipe,
  HighlightPipe,
  TranslatePipe,
} from './pipes/index';

// ============================================
// Directives
// ============================================

import {
  ClickOutsideDirective,
  HasPermissionDirective,
  LoadingDirective,
  HighlightTextDirective,
  AutoFocusDirective,
} from './directives/index';

// ============================================
// Widgets
// ============================================

import {
  KPIWidgetComponent,
  StatsCardComponent,
  ChartWidgetComponent,
  ProgressWidgetComponent,
  ActivityFeedComponent,
} from './widgets/index';

// ============================================
// Collections for Easy Import
// ============================================

const UI_FORM_COMPONENTS = [
  InputComponent,
  ButtonComponent,
  SelectComponent,
  CheckboxComponent,
  RadioComponent,
  ToggleComponent,
  DatePickerComponent,
];

const UI_DISPLAY_COMPONENTS = [
  CardComponent,
  BadgeComponent,
  IconComponent,
  BreadcrumbComponent,
];

const UI_COMPLEX_COMPONENTS = [
  DropdownComponent,
  TabsComponent,
  AccordionComponent,
  ModalComponent,
];

const UI_DATA_COMPONENTS = [
  DataTableComponent,
  FilterPanelComponent,
  SearchInputComponent,
];

const UI_VISUALIZATION_COMPONENTS = [ChartComponent, KPICardComponent];

const UI_CONNECTION_COMPONENTS = [
  ConnectionStatusComponent,
  NotificationCenterComponent,
];

const ALL_UI_COMPONENTS = [
  ...UI_FORM_COMPONENTS,
  ...UI_DISPLAY_COMPONENTS,
  ...UI_COMPLEX_COMPONENTS,
  ...UI_DATA_COMPONENTS,
  ...UI_VISUALIZATION_COMPONENTS,
  ...UI_CONNECTION_COMPONENTS,
];

const COMMON_COMPONENTS = [
  DataGridComponent,
  ExportButtonComponent,
  PaginationComponent,
  EmptyStateComponent,
  LoadingSkeletonComponent,
  ToastComponent,
  AlertComponent,
  ConfirmDialogComponent,
  BreadcrumbsComponent,
];

const ALL_COMPONENTS = [...ALL_UI_COMPONENTS, ...COMMON_COMPONENTS];

const PIPES = [
  SafeHtmlPipe,
  CurrencyFormatPipe,
  DateFormatPipe,
  TruncatePipe,
  HighlightPipe,
  TranslatePipe,
];

const DIRECTIVES = [
  ClickOutsideDirective,
  HasPermissionDirective,
  LoadingDirective,
  HighlightTextDirective,
  AutoFocusDirective,
];

const WIDGETS = [
  KPIWidgetComponent,
  StatsCardComponent,
  ChartWidgetComponent,
  ProgressWidgetComponent,
  ActivityFeedComponent,
];

/**
 * Shared Module
 * Provides all shared, reusable components, pipes, directives, and widgets
 *
 * Import in feature modules:
 * @NgModule({
 *   imports: [SharedModule]
 * })
 * export class FeatureModule {}
 */
@NgModule({
  imports: [
    CommonModule,
    ...ALL_COMPONENTS,
    ...PIPES,
    ...DIRECTIVES,
    ...WIDGETS,
  ],
  exports: [
    CommonModule,
    ...ALL_COMPONENTS,
    ...PIPES,
    ...DIRECTIVES,
    ...WIDGETS,
  ],
})
export class SharedModule {}
