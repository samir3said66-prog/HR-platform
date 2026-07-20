/**
 * Table Utilities
 * Helper functions for table operations
 */

import { TableFilter, TableSort } from '../models/table.model';

export class TableUtil {
  static sortData<T>(data: T[], sort: TableSort): T[] {
    if (!sort) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sort.column];
      const bValue = (b as any)[sort.column];

      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static filterData<T>(data: T[], filters: TableFilter[]): T[] {
    if (!filters || filters.length === 0) return data;

    return data.filter((item) => {
      return filters.every((filter) => this.applyFilter(item, filter));
    });
  }

  private static applyFilter<T>(item: T, filter: TableFilter): boolean {
    const value = (item as any)[filter.column];

    switch (filter.operator) {
      case 'eq':
        return value === filter.value;
      case 'neq':
        return value !== filter.value;
      case 'contains':
        return String(value).includes(String(filter.value));
      case 'gt':
        return value > filter.value;
      case 'lt':
        return value < filter.value;
      case 'gte':
        return value >= filter.value;
      case 'lte':
        return value <= filter.value;
      default:
        return true;
    }
  }
}
