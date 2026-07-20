# Shared Module Guide

All reusable components, pipes, directives, and widgets live in `src/app/shared/`.

---

## Quick Import Reference

### Standalone component (preferred)
```typescript
import { ButtonComponent, InputComponent } from '@app/shared/components/ui';
```

### Component group (for modules)
```typescript
import { UI_FORM_COMPONENTS, COMMON_COMPONENTS } from '@app/shared/components';

@NgModule({ imports: [...UI_FORM_COMPONENTS, ...COMMON_COMPONENTS] })
```

### Full SharedModule (NgModule approach)
```typescript
import { SharedModule } from '@app/shared';
@NgModule({ imports: [SharedModule] })
```

---

## UI Components (22)

### Form (7)
| Component | Selector | Key Inputs |
|-----------|----------|-----------|
| InputComponent | `app-input` | `type`, `placeholder`, `formControl` |
| ButtonComponent | `app-button` | `variant` (primary/secondary/danger), `loading` |
| SelectComponent | `app-select` | `options`, `formControl`, `searchable` |
| CheckboxComponent | `app-checkbox` | `label`, `formControl` |
| RadioComponent | `app-radio` | `options`, `formControl` |
| ToggleComponent | `app-toggle` | `label`, `formControl` |
| DatePickerComponent | `app-date-picker` | `minDate`, `maxDate`, `formControl` |

### Display (4)
| Component | Selector | Key Inputs |
|-----------|----------|-----------|
| CardComponent | `app-card` | `title`, `subtitle`, `padding` |
| BadgeComponent | `app-badge` | `variant`, `size` |
| IconComponent | `app-icon` | `name`, `size`, `color` |
| BreadcrumbComponent | `app-breadcrumb` | `items: Breadcrumb[]` |

### Complex (4)
| Component | Selector | Key Inputs |
|-----------|----------|-----------|
| DropdownComponent | `app-dropdown` | `items`, `trigger` |
| TabsComponent | `app-tabs` | `tabs`, `activeTab` |
| AccordionComponent | `app-accordion` | `items`, `multiple` |
| ModalComponent | `app-modal` | `title`, `size`, `open` |

### Data (3)
| Component | Selector | Key Inputs |
|-----------|----------|-----------|
| DataTableComponent | `app-data-table` | `columns`, `data`, `pageSize` |
| FilterPanelComponent | `app-filter-panel` | `filters`, `values` |
| SearchInputComponent | `app-search-input` | `placeholder`, `debounce` |

### Visualization (2)
| Component | Selector | Key Inputs |
|-----------|----------|-----------|
| ChartComponent | `app-chart` | `type`, `data`, `options` |
| KpiCardComponent | `app-kpi-card` | `title`, `value`, `trend` |

### Connection (2)
| Component | Selector | Key Inputs |
|-----------|----------|-----------|
| ConnectionStatusComponent | `app-connection-status` | — |
| NotificationCenterComponent | `app-notification-center` | `notifications` |

---

## Common Components (9)

| Component | Purpose |
|-----------|---------|
| DataGridComponent | Advanced sortable/filterable grid |
| ExportButtonComponent | Export CSV / Excel / PDF |
| PaginationComponent | Page navigation controls |
| EmptyStateComponent | No-data placeholder |
| LoadingSkeletonComponent | Animated loading placeholder |
| ToastComponent | Brief notification pop-ups |
| AlertComponent | Inline alerts (info/warn/error/success) |
| ConfirmDialogComponent | Confirmation modal |
| BreadcrumbsComponent | Page breadcrumb navigation |

---

## Pipes (6)

```html
<!-- Translate i18n key -->
{{ 'dashboard.title' | translate }}

<!-- Format currency -->
{{ employee.salary | currencyFormat:'USD' }}

<!-- Format date -->
{{ employee.hireDate | dateFormat:'short' }}

<!-- Truncate text -->
{{ longDescription | truncate:80 }}

<!-- Safe HTML (sanitized) -->
<div [innerHTML]="richText | safeHtml"></div>

<!-- Highlight search term -->
{{ result | highlight:searchQuery }}
```

---

## Directives (5)

```html
<!-- Show/hide by permission -->
<button *appHasPermission="'employees.delete'">Delete</button>

<!-- Loading overlay -->
<div [appLoading]="isLoading">Content</div>

<!-- Close on outside click -->
<div (appClickOutside)="closeDropdown()">…</div>

<!-- Highlight matching text -->
<span [appHighlightText]="searchTerm">{{ text }}</span>

<!-- Auto-focus on init -->
<input [appAutoFocus]="true" />
```

---

## Widgets (5)

```typescript
// KPI Widget
@Input() data: { title: string; value: string; unit: string; trend: 'up'|'down'; trendValue: number }

// Stats Card
@Input() data: { title: string; value: number; change: number; icon: string; color: string }

// Chart Widget
@Input() data: { title: string; type: 'bar'|'line'|'pie'; data: any; options?: any }

// Progress Widget
@Input() title: string;
@Input() value: number;  // 0–100

// Activity Feed
@Input() activities: { id; user; action; time; icon }[]
```

---

## Models

```typescript
// table.model.ts
interface TableColumn { key; label; sortable?; filterable?; width? }
interface TableConfig { columns; pageSize?; pageable? }

// filter.model.ts
interface FilterCriteria { field; operator: FilterOperator; value }
type FilterOperator = 'equals'|'contains'|'startsWith'|'greaterThan'|'lessThan'|'between'

// ui.model.ts
interface Toast { id; message; type: 'success'|'error'|'info'|'warning'; duration? }
interface Breadcrumb { label; url; icon? }
interface Notification { id; title; message; type; read; timestamp }
```

---

## Utilities

```typescript
import { TableUtil, FormUtil, ExportUtil } from '@app/shared/utils';

TableUtil.sortData(data, { field: 'name', direction: 'asc' });
TableUtil.filterData(data, [{ field: 'dept', operator: 'equals', value: 'Engineering' }]);

FormUtil.markFormGroupTouched(formGroup);
FormUtil.getFormErrors(formGroup);   // returns { field: errorMessage }

ExportUtil.exportToCSV(data, 'employees-report');
ExportUtil.exportToJSON(data, 'backup');
```

---

## Best Practices

1. **Prefer standalone imports** over `SharedModule` — better tree-shaking
2. **Use `OnPush`** — all shared components already use it
3. **Use pipes in templates** — avoid calling functions in templates
4. **Use `*appHasPermission`** — not raw `*ngIf="user.role === 'admin'"`
5. **Keep shared components dumb** — no store access, inputs/outputs only
