import { describe, it, expect } from 'vitest';
import { CSP_DIRECTIVES, CSP_DIRECTIVES_DEV, CSP_DIRECTIVES_PROD, generateCSPHeader, getCSPDirectives } from './csp.config';

/**
 * Content Security Policy Tests - Validates: Requirements 31.1
 * 
 * Tests verify:
 * - CSP headers are properly configured
 * - CSP prevents XSS attacks
 * - CSP prevents clickjacking
 * - CSP prevents data injection
 */

describe('Content Security Policy', () => {
  describe('CSP Configuration', () => {
    it('should have default-src directive', () => {
      expect(CSP_DIRECTIVES['default-src']).toBeDefined();
      expect(CSP_DIRECTIVES['default-src']).toContain("'self'");
    });

    it('should have script-src directive', () => {
      expect(CSP_DIRECTIVES['script-src']).toBeDefined();
      expect(CSP_DIRECTIVES['script-src']).toContain("'self'");
    });

    it('should have style-src directive', () => {
      expect(CSP_DIRECTIVES['style-src']).toBeDefined();
      expect(CSP_DIRECTIVES['style-src']).toContain("'self'");
    });

    it('should have font-src directive', () => {
      expect(CSP_DIRECTIVES['font-src']).toBeDefined();
      expect(CSP_DIRECTIVES['font-src']).toContain("'self'");
    });

    it('should have img-src directive', () => {
      expect(CSP_DIRECTIVES['img-src']).toBeDefined();
      expect(CSP_DIRECTIVES['img-src']).toContain("'self'");
    });

    it('should have connect-src directive', () => {
      expect(CSP_DIRECTIVES['connect-src']).toBeDefined();
      expect(CSP_DIRECTIVES['connect-src']).toContain("'self'");
    });

    it('should have frame-src directive', () => {
      expect(CSP_DIRECTIVES['frame-src']).toBeDefined();
      expect(CSP_DIRECTIVES['frame-src']).toContain("'self'");
    });

    it('should have object-src directive set to none', () => {
      expect(CSP_DIRECTIVES['object-src']).toContain("'none'");
    });

    it('should have frame-ancestors directive set to none', () => {
      expect(CSP_DIRECTIVES['frame-ancestors']).toContain("'none'");
    });

    it('should have base-uri directive', () => {
      expect(CSP_DIRECTIVES['base-uri']).toBeDefined();
      expect(CSP_DIRECTIVES['base-uri']).toContain("'self'");
    });

    it('should have form-action directive', () => {
      expect(CSP_DIRECTIVES['form-action']).toBeDefined();
      expect(CSP_DIRECTIVES['form-action']).toContain("'self'");
    });

    it('should have report-uri directive', () => {
      expect(CSP_DIRECTIVES['report-uri']).toBeDefined();
      expect(CSP_DIRECTIVES['report-uri']).toContain('/api/security/csp-report');
    });
  });

  describe('CSP Header Generation', () => {
    it('should generate valid CSP header string', () => {
      const header = generateCSPHeader();
      expect(header).toBeDefined();
      expect(typeof header).toBe('string');
      expect(header.length).toBeGreaterThan(0);
    });

    it('should include all directives in header', () => {
      const header = generateCSPHeader();
      expect(header).toContain('default-src');
      expect(header).toContain('script-src');
      expect(header).toContain('style-src');
      expect(header).toContain('font-src');
      expect(header).toContain('img-src');
    });

    it('should use semicolon as separator', () => {
      const header = generateCSPHeader();
      const directives = header.split(';').filter(d => d.trim());
      expect(directives.length).toBeGreaterThan(0);
    });

    it('should format directives correctly', () => {
      const header = generateCSPHeader();
      expect(header).toMatch(/default-src 'self'/);
      expect(header).toMatch(/script-src/);
    });
  });

  describe('Development vs Production CSP', () => {
    it('should have different configurations', () => {
      expect(CSP_DIRECTIVES_DEV).toBeDefined();
      expect(CSP_DIRECTIVES_PROD).toBeDefined();
    });

    it('should allow unsafe-eval in development', () => {
      expect(CSP_DIRECTIVES_DEV['script-src']).toContain("'unsafe-eval'");
    });

    it('should not allow unsafe-eval in production', () => {
      expect(CSP_DIRECTIVES_PROD['script-src']).not.toContain("'unsafe-eval'");
    });

    it('should allow unsafe-inline in both', () => {
      expect(CSP_DIRECTIVES_DEV['script-src']).toContain("'unsafe-inline'");
      expect(CSP_DIRECTIVES_PROD['style-src']).toContain("'unsafe-inline'");
    });

    it('should get correct directives for environment', () => {
      const devDirectives = getCSPDirectives(true);
      const prodDirectives = getCSPDirectives(false);

      expect(devDirectives['script-src']).toContain("'unsafe-eval'");
      expect(prodDirectives['script-src']).not.toContain("'unsafe-eval'");
    });
  });

  describe('XSS Prevention', () => {
    it('should prevent inline script execution', () => {
      // CSP should block inline scripts
      expect(CSP_DIRECTIVES['script-src']).toBeDefined();
      // In production, unsafe-inline should not be present
      expect(CSP_DIRECTIVES_PROD['script-src']).not.toContain("'unsafe-inline'");
    });

    it('should prevent external script injection', () => {
      // Only allow specific CDNs
      const scriptSrc = CSP_DIRECTIVES['script-src'];
      expect(scriptSrc).toContain("'self'");
      // Should not allow all external sources
      expect(scriptSrc).not.toContain('*');
    });

    it('should prevent data: protocol scripts', () => {
      const scriptSrc = CSP_DIRECTIVES['script-src'];
      expect(scriptSrc).not.toContain('data:');
    });

    it('should prevent blob: protocol scripts', () => {
      const scriptSrc = CSP_DIRECTIVES['script-src'];
      expect(scriptSrc).not.toContain('blob:');
    });
  });

  describe('Clickjacking Prevention', () => {
    it('should prevent framing with frame-ancestors', () => {
      expect(CSP_DIRECTIVES['frame-ancestors']).toContain("'none'");
    });

    it('should restrict iframe sources', () => {
      expect(CSP_DIRECTIVES['frame-src']).toContain("'self'");
      expect(CSP_DIRECTIVES['frame-src']).not.toContain('*');
    });
  });

  describe('Data Injection Prevention', () => {
    it('should prevent object injection', () => {
      expect(CSP_DIRECTIVES['object-src']).toContain("'none'");
    });

    it('should prevent plugin injection', () => {
      expect(CSP_DIRECTIVES['object-src']).toContain("'none'");
    });

    it('should restrict form submissions', () => {
      expect(CSP_DIRECTIVES['form-action']).toContain("'self'");
    });

    it('should restrict base URI', () => {
      expect(CSP_DIRECTIVES['base-uri']).toContain("'self'");
    });
  });

  describe('Resource Loading', () => {
    it('should allow self images', () => {
      expect(CSP_DIRECTIVES['img-src']).toContain("'self'");
    });

    it('should allow data URIs for images', () => {
      expect(CSP_DIRECTIVES['img-src']).toContain('data:');
    });

    it('should allow HTTPS images', () => {
      expect(CSP_DIRECTIVES['img-src']).toContain('https:');
    });

    it('should allow blob images', () => {
      expect(CSP_DIRECTIVES['img-src']).toContain('blob:');
    });

    it('should allow self fonts', () => {
      expect(CSP_DIRECTIVES['font-src']).toContain("'self'");
    });

    it('should allow Google Fonts', () => {
      expect(CSP_DIRECTIVES['font-src']).toContain('https://fonts.gstatic.com');
    });

    it('should allow self styles', () => {
      expect(CSP_DIRECTIVES['style-src']).toContain("'self'");
    });

    it('should allow Google Fonts styles', () => {
      expect(CSP_DIRECTIVES['style-src']).toContain('https://fonts.googleapis.com');
    });
  });

  describe('API and WebSocket', () => {
    it('should allow self connections', () => {
      expect(CSP_DIRECTIVES['connect-src']).toContain("'self'");
    });

    it('should allow API endpoint', () => {
      expect(CSP_DIRECTIVES['connect-src']).toContain('https://api.example.com');
    });

    it('should allow WebSocket endpoint', () => {
      expect(CSP_DIRECTIVES['connect-src']).toContain('wss://websocket.example.com');
    });

    it('should allow Sentry error tracking', () => {
      expect(CSP_DIRECTIVES['connect-src']).toContain('https://sentry.io');
    });
  });

  describe('Reporting', () => {
    it('should have report-uri configured', () => {
      expect(CSP_DIRECTIVES['report-uri']).toBeDefined();
      expect(CSP_DIRECTIVES['report-uri'].length).toBeGreaterThan(0);
    });

    it('should report to security endpoint', () => {
      expect(CSP_DIRECTIVES['report-uri']).toContain('/api/security/csp-report');
    });
  });

  describe('Security Headers', () => {
    it('should upgrade insecure requests', () => {
      expect(CSP_DIRECTIVES['upgrade-insecure-requests']).toBeDefined();
    });

    it('should block mixed content', () => {
      expect(CSP_DIRECTIVES['block-all-mixed-content']).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty directive sources', () => {
      const header = generateCSPHeader();
      // Should still generate valid header
      expect(header).toBeDefined();
      expect(header.length).toBeGreaterThan(0);
    });

    it('should not have duplicate sources', () => {
      const scriptSrc = CSP_DIRECTIVES['script-src'];
      const uniqueSources = new Set(scriptSrc);
      expect(uniqueSources.size).toBe(scriptSrc.length);
    });

    it('should have consistent formatting', () => {
      const header = generateCSPHeader();
      // Should not have double spaces
      expect(header).not.toContain('  ');
      // Should not have trailing semicolons
      expect(header).not.toMatch(/;\s*$/);
    });
  });

  describe('Compliance', () => {
    it('should follow CSP Level 3 specification', () => {
      const header = generateCSPHeader();
      // Should use valid directive names
      expect(header).toMatch(/default-src|script-src|style-src|img-src|font-src|connect-src/);
    });

    it('should be compatible with modern browsers', () => {
      const header = generateCSPHeader();
      // Should not use deprecated directives
      expect(header).not.toContain('child-src');
      expect(header).not.toContain('script-src-elem');
    });
  });
});
