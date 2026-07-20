/**
 * API Constants
 * Base URLs and API endpoint configurations
 */

export const API_CONSTANTS = {
  // Base URLs
  BASE_URL: '/api',
  
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },

  // Employees endpoints
  EMPLOYEES: {
    LIST: '/employees',
    GET: '/employees/:id',
    CREATE: '/employees',
    UPDATE: '/employees/:id',
    DELETE: '/employees/:id',
    SEARCH: '/employees/search',
  },

  // Performance endpoints
  PERFORMANCE: {
    LIST: '/performance',
    GET: '/performance/:id',
    CREATE: '/performance',
    UPDATE: '/performance/:id',
    DELETE: '/performance/:id',
  },

  // Dashboard endpoints
  DASHBOARD: {
    STATS: '/dashboard/stats',
    CHARTS: '/dashboard/charts',
    KPI: '/dashboard/kpi',
  },

  // Reports endpoints
  REPORTS: {
    LIST: '/reports',
    GET: '/reports/:id',
    EXPORT: '/reports/:id/export',
    GENERATE: '/reports/generate',
  },

  // Pagination defaults
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },

  // Timeout settings (in milliseconds)
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
};
