/**
 * Table Models
 * Models for table/data-grid configuration
 */

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  template?: string;
  formatter?: (value: any) => string;
}

export interface TableConfig {
  columns: TableColumn[];
  pageSize?: number;
  pageable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  expandable?: boolean;
}

export interface TableSort {
  column: string;
  direction: 'asc' | 'desc';
}

export interface TableFilter {
  column: string;
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte';
  value: any;
}
