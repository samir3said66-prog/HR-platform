/**
 * Filter Models
 * Models for filtering and search
 */

export interface FilterCriteria {
  field: string;
  operator: FilterOperator;
  value: any;
  caseSensitive?: boolean;
}

export type FilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'in'
  | 'notIn'
  | 'between'
  | 'isEmpty'
  | 'isNotEmpty';

export interface AdvancedFilter {
  criteria: FilterCriteria[];
  logic: 'AND' | 'OR';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}
