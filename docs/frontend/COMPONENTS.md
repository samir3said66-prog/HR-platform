# Component Library Reference

All components live in `src/app/shared/components/`.

---

## Import Paths

```typescript
// Individual component
import { ButtonComponent } from '@app/shared/components/ui';

// Group imports
import {
  UI_FORM_COMPONENTS,
  UI_DISPLAY_COMPONENTS,
  UI_COMPLEX_COMPONENTS,
  UI_DATA_COMPONENTS,
  UI_VISUALIZATION_COMPONENTS,
  UI_CONNECTION_COMPONENTS,
  ALL_UI_COMPONENTS,
  COMMON_COMPONENTS
} from '@app/shared/components';
```

---

## ButtonComponent

```typescript
@Input() variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary'
@Input() size: 'sm' | 'md' | 'lg' = 'md'
@Input() loading: boolean = false
@Input() disabled: boolean = false
@Input() type: 'button' | 'submit' | 'reset' = 'button'
@Output() clicked = new EventEmitter<MouseEvent>()
```

```html
<app-button variant="primary" (clicked)="save()">Save</app-button>
<app-button variant="danger" [loading]="isSaving">Delete</app-button>
```

---

## InputComponent

```typescript
@Input() type: 'text' | 'email' | 'password' | 'number' | 'tel' = 'text'
@Input() placeholder: string = ''
@Input() label: string = ''
@Input() required: boolean = false
@Input() disabled: boolean = false
@Input() error: string = ''
@Input() formControl: FormControl
```

```html
<app-input label="Email" type="email" [formControl]="emailControl" />
```

---

## SelectComponent

```typescript
@Input() options: { label: string; value: any }[] = []
@Input() placeholder: string = 'Select...'
@Input() searchable: boolean = false
@Input() multiple: boolean = false
@Input() formControl: FormControl
@Output() changed = new EventEmitter<any>()
```

---

## CardComponent

```typescript
@Input() title: string = ''
@Input() subtitle: string = ''
@Input() padding: 'none' | 'sm' | 'md' | 'lg' = 'md'
@Input() shadow: boolean = true
@Input() border: boolean = false
```

```html
<app-card title="Employee Summary" subtitle="Q4 2026">
  <!-- content -->
</app-card>
```

---

## DataTableComponent

```typescript
@Input() columns: TableColumn[] = []
@Input() data: any[] = []
@Input() pageSize: number = 25
@Input() loading: boolean = false
@Input() selectable: boolean = false
@Input() sortable: boolean = true
@Output() rowClick = new EventEmitter<any>()
@Output() selectionChange = new EventEmitter<any[]>()
@Output() sortChange = new EventEmitter<{ field: string; direction: 'asc'|'desc' }>()
```

```typescript
// Usage
columns: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'department', label: 'Department', filterable: true },
  { key: 'salary', label: 'Salary', sortable: true, width: '120px' }
];
```

---

## ModalComponent

```typescript
@Input() open: boolean = false
@Input() title: string = ''
@Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md'
@Input() closable: boolean = true
@Output() closed = new EventEmitter<void>()
```

```html
<app-modal [open]="showModal" title="Confirm Action" (closed)="showModal = false">
  <p>Are you sure?</p>
  <app-button variant="danger" (clicked)="confirm()">Yes, proceed</app-button>
</app-modal>
```

---

## KpiCardComponent

```typescript
@Input() data: {
  title: string;
  value: string | number;
  unit?: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue?: number;
  icon?: string;
  color?: string;
}
```

```html
<app-kpi-card [data]="{ title: 'Total Employees', value: 1284, trend: 'up', trendValue: 3.2 }" />
```

---

## ExportButtonComponent

```typescript
@Input() data: any[] = []
@Input() filename: string = 'export'
@Input() formats: ('csv' | 'xlsx' | 'pdf')[] = ['csv', 'xlsx']
@Output() exported = new EventEmitter<string>()
```

```html
<app-export-button [data]="employees" filename="employees-report" />
```

---

## SearchInputComponent

```typescript
@Input() placeholder: string = 'Search...'
@Input() debounce: number = 300   // ms
@Input() minLength: number = 2
@Output() search = new EventEmitter<string>()
@Output() clear = new EventEmitter<void>()
```

---

## ConnectionStatusComponent

Displays WebSocket connection status badge automatically.
No inputs required — reads from WebSocketService.

```html
<app-connection-status />
```

---

## EmptyStateComponent

```typescript
@Input() title: string = 'No data found'
@Input() message: string = ''
@Input() icon: string = 'empty'
@Input() actionLabel: string = ''
@Output() action = new EventEmitter<void>()
```

---

## PaginationComponent

```typescript
@Input() total: number = 0
@Input() pageSize: number = 25
@Input() currentPage: number = 1
@Output() pageChange = new EventEmitter<number>()
@Output() pageSizeChange = new EventEmitter<number>()
```

---

## Component Groups Reference

| Export Name | Components |
|-------------|-----------|
| `UI_FORM_COMPONENTS` | Input, Button, Select, Checkbox, Radio, Toggle, DatePicker |
| `UI_DISPLAY_COMPONENTS` | Card, Badge, Icon, Breadcrumb |
| `UI_COMPLEX_COMPONENTS` | Dropdown, Tabs, Accordion, Modal |
| `UI_DATA_COMPONENTS` | DataTable, FilterPanel, SearchInput |
| `UI_VISUALIZATION_COMPONENTS` | Chart, KpiCard |
| `UI_CONNECTION_COMPONENTS` | ConnectionStatus, NotificationCenter |
| `ALL_UI_COMPONENTS` | All 22 UI components |
| `COMMON_COMPONENTS` | All 9 common components |

---

## Accessibility Standards

All components follow WCAG 2.1 AA:
- Semantic HTML (`<button>`, `<label>`, `<nav>`, etc.)
- ARIA attributes where needed (`aria-label`, `role`, `aria-expanded`)
- Keyboard navigation (Tab, Enter, Space, Escape)
- Minimum 44×44px touch targets
- 4.5:1 color contrast ratio
- Focus indicators visible on all interactive elements
