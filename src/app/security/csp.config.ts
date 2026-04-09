/**
 * Content Security Policy Configuration - Validates: Requirements 31.1
 * 
 * Defines CSP headers to prevent:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - Data injection
 * - Unauthorized resource loading
 */

export interface CSPDirective {
  [key: string]: string[];
}

export const CSP_DIRECTIVES: CSPDirective = {
  // Default source for all content types
  'default-src': ["'self'"],

  // Script sources - only allow self and trusted CDNs
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Only for inline styles, remove in production
    'https://cdn.jsdelivr.net',
    'https://cdnjs.cloudflare.com'
  ],

  // Style sources
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for Tailwind CSS
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net'
  ],

  // Font sources
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'https://cdn.jsdelivr.net',
    'data:'
  ],

  // Image sources
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:'
  ],

  // Media sources (audio/video)
  'media-src': [
    "'self'",
    'https:'
  ],

  // Connect sources (XHR, WebSocket, etc.)
  'connect-src': [
    "'self'",
    'https://api.example.com',
    'wss://websocket.example.com',
    'https://sentry.io'
  ],

  // Frame sources (iframes)
  'frame-src': [
    "'self'"
  ],

  // Object sources (plugins)
  'object-src': ["'none'"],

  // Base URI
  'base-uri': ["'self'"],

  // Form action
  'form-action': ["'self'"],

  // Frame ancestors (clickjacking protection)
  'frame-ancestors': ["'none'"],

  // Upgrade insecure requests
  'upgrade-insecure-requests': [],

  // Block all mixed content
  'block-all-mixed-content': [],

  // Report URI for CSP violations
  'report-uri': ['/api/security/csp-report']
};

/**
 * Generate CSP header string
 */
export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      if (sources.length === 0) {
        return directive;
      }
      return `${directive} ${sources.join(' ')}`;
    })
    .join('; ');
}

/**
 * CSP for development (more permissive)
 */
export const CSP_DIRECTIVES_DEV: CSPDirective = {
  ...CSP_DIRECTIVES,
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'", // Allow eval for development
    'https://cdn.jsdelivr.net',
    'https://cdnjs.cloudflare.com'
  ]
};

/**
 * CSP for production (strict)
 */
export const CSP_DIRECTIVES_PROD: CSPDirective = {
  ...CSP_DIRECTIVES,
  'script-src': [
    "'self'",
    'https://cdn.jsdelivr.net',
    'https://cdnjs.cloudflare.com'
  ],
  'style-src': [
    "'self'",
    'https://fonts.googleapis.com',
    'https://cdn.jsdelivr.net'
  ]
};

/**
 * Get CSP directives based on environment
 */
export function getCSPDirectives(isDevelopment: boolean = false): CSPDirective {
  return isDevelopment ? CSP_DIRECTIVES_DEV : CSP_DIRECTIVES_PROD;
}
